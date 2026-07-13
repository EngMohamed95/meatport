param(
  [string]$WorkbookPath = "Meat Port 2.xlsx"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$workbookFullPath = Join-Path $root $WorkbookPath
$extractDir = Join-Path $root ".tmp_meatport_import"

if (-not (Test-Path $workbookFullPath)) {
  throw "Workbook not found: $workbookFullPath"
}

if (Test-Path $extractDir) {
  Remove-Item -LiteralPath $extractDir -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $extractDir | Out-Null
$zipPath = Join-Path $extractDir "workbook.zip"
Copy-Item -LiteralPath $workbookFullPath -Destination $zipPath -Force
Expand-Archive -LiteralPath $zipPath -DestinationPath $extractDir -Force

function Load-Xml($path) {
  $xml = New-Object System.Xml.XmlDocument
  $xml.PreserveWhitespace = $false
  $xml.Load($path)
  return $xml
}

function Get-ColIndex([string]$cellRef) {
  $letters = $cellRef -replace "\d", ""
  $index = 0
  foreach ($char in $letters.ToCharArray()) {
    $index = ($index * 26) + ([int][char]$char - [int][char]'A' + 1)
  }
  return $index
}

function Get-Slug([string]$value) {
  return (($value.ToLowerInvariant() -replace "[^a-z0-9]+", "-").Trim("-"))
}

function Get-TextValue($cell, $sharedStrings) {
  $valueNode = $cell.SelectSingleNode("*[local-name()='v']")
  if ($null -eq $valueNode) {
    $inlineNode = $cell.SelectSingleNode("*[local-name()='is']")
    if ($null -ne $inlineNode) { return $inlineNode.InnerText.Trim() }
    return $null
  }

  if ($cell.GetAttribute("t") -eq "s") {
    return $sharedStrings[[int]$valueNode.InnerText].Trim()
  }

  return $valueNode.InnerText.Trim()
}

function Get-Price([string[]]$cells) {
  for ($i = $cells.Count - 1; $i -ge 0; $i--) {
    $text = $cells[$i]
    if ([string]::IsNullOrWhiteSpace($text)) { continue }
    $match = [regex]::Match($text, "(?i)(\d+(?:[.,]\d+)?)\s*SAR")
    if ($match.Success) {
      return [double]($match.Groups[1].Value -replace ",", ".")
    }
  }
  return 0
}

function Test-ProductRow([string]$marker, [string]$name, [string[]]$cells) {
  if ($marker -in @("Food", "Product", "Drink")) { return $true }
  if ($marker -eq "Content" -and $name -match "^\s*\d+\s*-" -and (Get-Price $cells) -gt 0) { return $true }
  if ($marker -match "^\s*\d+\s*-" -and (Get-Price @($marker)) -gt 0) { return $true }
  return $false
}

function Get-Calories([string]$name) {
  $match = [regex]::Match($name, "(?i)(?:calori|callori|calories|kcal)[^\d]*(\d+)")
  if ($match.Success) { return [int]$match.Groups[1].Value }
  return $null
}

function Get-Allergens([string]$name) {
  $match = [regex]::Match($name, "(?i)(?:allergen|allerjen)[:;.\s]*([^,]+(?:,[^,]+)*)")
  if (-not $match.Success) { return @() }
  $raw = $match.Groups[1].Value -replace "\bfree\b", ""
  return @(
    $raw -split "[,./-]" |
      ForEach-Object { $_.Trim() } |
      Where-Object { $_ -and $_ -notmatch "^\d+$" } |
      Select-Object -Unique
  )
}

function Get-CleanName([string]$name) {
  $clean = $name -replace "^\s*\d+\s*-\s*", ""
  $clean = $clean -replace "\s*\(?\s*\d+(?:[.,]\d+)?\s*SAR\s*\)?\s*$", ""
  $clean = $clean -replace "(?i)\s*(?:\d+(?:/\d+)?\s*(?:gr|grams|ml|meter)|calori.*|callori.*|calories.*|kcal.*|allergen.*|allerjen.*).*$", ""
  $clean = $clean -replace "\s+", " "
  $clean.Trim(@(" ", ":", ";", ","))
}

function Get-TsString([string]$value) {
  if ($null -eq $value) { return "''" }
  return "'" + ($value -replace "\\", "\\" -replace "'", "\'") + "'"
}

function ConvertTo-TsObject($value, [int]$indent = 0) {
  $pad = " " * $indent
  $nextPad = " " * ($indent + 2)

  if ($null -eq $value) { return "null" }
  if ($value -is [string]) { return Get-TsString $value }
  if ($value -is [bool]) { return $value.ToString().ToLowerInvariant() }
  if ($value -is [int] -or $value -is [double] -or $value -is [decimal]) { return "$value" }
  if ($value -is [array]) {
    if ($value.Count -eq 0) { return "[]" }
    $items = $value | ForEach-Object { $nextPad + (ConvertTo-TsObject $_ ($indent + 2)) }
    return "[`n" + ($items -join ",`n") + "`n$pad]"
  }

  $props = @()
  foreach ($property in $value.PSObject.Properties) {
    $props += "$nextPad$($property.Name): " + (ConvertTo-TsObject $property.Value ($indent + 2))
  }
  return "{`n" + ($props -join ",`n") + "`n$pad}"
}

function Get-RowValues($row, $sharedStrings) {
  $values = @{}
  foreach ($cell in $row.SelectNodes("*[local-name()='c']")) {
    $values[(Get-ColIndex $cell.GetAttribute("r"))] = Get-TextValue $cell $sharedStrings
  }
  return $values
}

function Get-FirstText($values) {
  foreach ($index in 1..30) {
    if (-not [string]::IsNullOrWhiteSpace($values[$index])) {
      return $values[$index]
    }
  }
  return ""
}

$sharedStrings = @()
$sharedPath = Join-Path $extractDir "xl/sharedStrings.xml"
if (Test-Path $sharedPath) {
  $sharedXml = Load-Xml $sharedPath
  foreach ($item in $sharedXml.DocumentElement.ChildNodes) {
    $sharedStrings += $item.InnerText
  }
}

$workbookXml = Load-Xml (Join-Path $extractDir "xl/workbook.xml")
$relsXml = Load-Xml (Join-Path $extractDir "xl/_rels/workbook.xml.rels")
$rels = @{}
foreach ($rel in $relsXml.DocumentElement.ChildNodes) {
  $rels[$rel.GetAttribute("Id")] = $rel.GetAttribute("Target")
}

$ns = New-Object System.Xml.XmlNamespaceManager($workbookXml.NameTable)
$ns.AddNamespace("d", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")
$ns.AddNamespace("r", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")

$imageByCategory = @{
  "Steaks" = "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop&q=80"
  "Kebabs" = "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&q=80"
  "Meats" = "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop&q=80"
  "Hot Appetizers" = "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&h=300&fit=crop&q=80"
  "Mezes" = "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop&q=80"
  "Salads" = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&q=80"
  "Burgers" = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80"
  "Sauces" = "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&h=300&fit=crop&q=80"
  "Desserts" = "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop&q=80"
  "Drinks" = "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop&q=80"
}

$categoryArabicByName = @{
  "Steaks" = "ستيك"
  "Kebabs" = "كباب"
  "Meats" = "لحوم"
  "Mezes" = "مقبلات باردة"
  "Hot Appetizers" = "مقبلات ساخنة"
  "Salads" = "سلطات"
  "Meat Port Menu" = "قائمة ميت بورت"
  "Meatballs" = "كرات اللحم"
  "Specials" = "أطباق خاصة"
  "Shawarmas" = "شاورما"
  "Burgers" = "برجر"
  "Sauces" = "صوصات"
  "Desserts" = "حلويات"
  "Drinks" = "مشروبات"
}

$productArabicByName = @{
  "PORTEHOUSE STEAK" = "ستيك بورترهاوس"
  "FLORENTINA STEAK" = "ستيك فلورنتينا"
  "T-BÖNE STEAK" = "ستيك تي بون"
  "NEW YORK STEAK" = "ستيك نيويورك"
  "RIBEYE STEAK" = "ستيك ريب آي"
  "ENTRECOTE" = "ستيك أنتركوت"
  "DALLAS STEAK" = "ستيك دالاس"
  "TOMAHAWK STEAK" = "ستيك توماهوك"
  "LOKUM STEAK" = "ستيك لوكوم"
  "FİLET MİGNON" = "فيليه مينيون"
  "BEEF SHASLIK" = "شيش لحم بقري"
  "CHATEAUBRİAND (2 Personly)" = "شاتوبريان لشخصين"
  "CHATEAUBRİAND (4 Personly)" = "شاتوبريان لأربعة أشخاص"
  "ASSADO / Asado (for 2 persons)" = "أسادو لشخصين"
  "ASSADO / Asado (for 4 persons)" = "أسادو لأربعة أشخاص"
  "BEEF SPAGEHETTI" = "سباغيتي باللحم"
  "ADANA KEBAB" = "كباب أضنة"
  "URFA KEBAB" = "كباب أورفا"
  "BEYTİ WRAP" = "راب بيتي"
  "PISTACHIO KEBAB" = "كباب بالفستق"
  "GALATA CHEF'S KEBAB" = "كباب شيف غلطة"
  "BEEF KEBAB" = "كباب لحم بقري"
  "CHICKEN KEBAB" = "كباب دجاج"
  "KUŞLEME KEBAB (Lamb Tenderloin Kebab)" = "كباب كوشلمة لحم غنم"
  "ALİ NAZİK KEBAB" = "كباب علي نازك"
  "WHOLE CHICKEN" = "دجاجة كاملة"
  "HALF CHICKEN" = "نصف دجاجة"
  "PIPE KEBAB" = "كباب بايب"
  "METER KEBAB" = "كباب متر"
  "CHICKEN SHISH" = "شيش طاووق"
  "CHICKEN WING" = "أجنحة دجاج"
  "LAMB CHOPS" = "ريش غنم"
  "LAMB TANDERLOIN (lLOKUM İSTANBUL)" = "لوكوم إسطنبول من لحم الغنم"
  "LAMB SHISH" = "شيش غنم"
  "LAMB RIBS" = "ضلوع غنم"
  "LAMB LIVERr" = "كبدة غنم"
  "LAMB RACK" = "راك غنم"
  "LAMB CROWN (TAÇ)Crown with Butter" = "تاج غنم بالزبدة"
  "MIXED GRILL" = "مشاوي مشكلة"
  "BEEF SAUTE" = "سوتيه لحم بقري"
  "HUMMUS" = "حمص"
  "MOUTTEBELl (Smoked Eggplant Dip)" = "متبل باذنجان مدخن"
  "AVOCADO MASH" = "مهروس أفوكادو"
  "SPINACH BORANI" = "بوراني سبانخ"
  "ATOM (Yoghurt with Hot Butter & Chili)" = "أتوم زبادي بالزبدة الحارة"
  "SPICY PUREE" = "بيوريه حار"
  "MUHAMMARA" = "محمرة"
  "SHAKSHOUKA" = "شكشوكة"
  "STUFFED VINE LEAVERS" = "ورق عنب محشي"
  "HAYDARI;Strained Yoghurt with Garlic" = "حيدري زبادي مصفى بالثوم"
  "STUFFED DRIED EGGPLANT" = "باذنجان مجفف محشي"
  "FRIED BULGUR MEATBALLS" = "كبة برغل مقلية"
  "FRENCH FRIES" = "بطاطس مقلية"
  "ANTEP LAHMACUN" = "لحم بعجين عنتابي"
  "With KHASAR CHEESE Pide" = "بيدا بجبنة قشقوان"
  "CUBE MEAT PIDE" = "بيدا بلحم مكعبات"
  "CHEESE SALAD" = "سلطة جبنة"
  "BURRETA SALAD" = "سلطة بوراتا"
  "TABOULEH SALAD" = "سلطة تبولة"
  "CEASER SALAD:(Chicken or Shrimp)" = "سلطة سيزر دجاج أو جمبري"
  "GAVURDAGI SALAD" = "سلطة غافورداغي"
  "ICEBERG Lettuce Salad" = "سلطة خس آيسبرغ"
  "QUINOA SALAD" = "سلطة كينوا"
  "SHEPHER'S SALAD" = "سلطة الراعي"
  "BEEF CARPACCIO" = "كارباتشيو لحم بقري"
  "STEAK TARTAR" = "ستيك تارتار"
  "Chef's Soup" = "شوربة الشيف"
  "Turkish Pickles" = "مخللات تركية"
  "YUVALAMA SOUP" = "شوربة يوفالاما"
  "KELLE PAÇA ( HEAD-TROTTERS )SOUP" = "شوربة كلة باشا"
  "TURKISH SPECIAL PICKLES" = "مخللات تركية خاصة"
  "CHEFF OKTAY MEAT BALLS" = "كرات لحم الشيف أوكتاي"
  "Grilled Meatballs Stuffed with Kashar Cheese" = "كرات لحم مشوية محشية بجبنة قشقوان"
  "LAMB TANDOOR(Slow-Cooked Lamb)" = "تندور غنم مطهو ببطء"
  "SALT BAKED LAMB SHOULDERS" = "كتف غنم مطهو بالملح"
  "SALT BAKED LAMB SHANKS" = "موزات غنم مطهوة بالملح"
  "Beef Shawarma" = "شاورما لحم"
  "Iskender Kebab" = "كباب إسكندر"
  "Beef shawarmas Sandwich" = "ساندوتش شاورما لحم"
  "Beef shawarmas WRAP" = "راب شاورما لحم"
  "Classic Burger" = "برجر كلاسيك"
  "Turkish Delight Burger" = "برجر تركيش ديلايت"
  "Chef's Burger" = "برجر الشيف"
  "Mini Burger" = "ميني برجر"
  "Cheddar Cheese Sauce" = "صوص جبنة شيدر"
  "Cafe de Paris Butter Sauce" = "صوص زبدة كافيه دي باريس"
  "Demi-Glace" = "صوص ديمي جلاس"
  "Black pepper sauce" = "صوص فلفل أسود"
  "Carrot Slice Baklava" = "بقلاوة شريحة جزر"
  "Pistachio Sarma" = "سارما بالفستق"
  "Cold Baklava" = "بقلاوة باردة"
  "Walnut Baklava" = "بقلاوة بالجوز"
  "Bird's Nest Baklava" = "بقلاوة عش العصفور"
  "oktay chefs walnut turkish baklava" = "بقلاوة تركية بالجوز من الشيف أوكتاي"
  "-Pistachio Katmer" = "كاتمر بالفستق"
  "OVEN RICE PUDING" = "أرز بالحليب في الفرن"
  "Künefe" = "كنافة"
  "Chocolate Souffle" = "سوفليه شوكولاتة"
  "Ice Cream with Kaymak" = "آيس كريم بالقشطة"
  "1 Pcs.Pineapple" = "قطعة أناناس"
  "PINA COLADA: Pineapple" = "بينا كولادا بالأناناس"
  "FRESH PINEAPPLE JUICE;Fresh pineapple" = "عصير أناناس طازج"
  "FRESH ORANGE JUICE: Fresh orange juice" = "عصير برتقال طازج"
  "SUMMER PUNCH:Orange juice" = "سمر بانش بالبرتقال"
  "LAVENDER JUICE:Water" = "عصير لافندر"
  "MİX STRAWBERRY LEMONADEN:Strawberry puree" = "ليمونادة فراولة"
  "FRESH LIMONADEN MİNT:lemon juice" = "ليمونادة نعناع طازجة"
  "OREO SHAKE:Milk" = "ميلك شيك أوريو"
  "MANGO JUICE:Mango pulp" = "عصير مانجو"
  "APPLE SHAKE:Apple juice/Puree" = "ميلك شيك تفاح"
  "PASSION FRUIT MOJITO:Passion fruit puree" = "موهيتو باشن فروت"
  "COCONUT VANİLLA:Coconut milk" = "كوكونت فانيلا"
  "CARROT JUICE:Fresh Carrot Juice" = "عصير جزر طازج"
  "SOFT DRINKS" = "مشروبات غازية"
  "PEPSI" = "بيبسي"
  "PEPSI LIGHT" = "بيبسي لايت"
  "PEPSI ZERO SUGAR" = "بيبسي زيرو"
  "SEVEN UP" = "سفن أب"
  "MIRANDA" = "ميرندا"
  "COCA COLA" = "كوكاكولا"
  "SMALL BOTTLE WATER" = "زجاجة مياه صغيرة"
  "SPARKLING WATER 200 :ML." = "مياه غازية 200 مل"
  "BIG BOTTLE WATER 1LT." = "زجاجة مياه كبيرة 1 لتر"
  "120SODA" = "صودا"
  "TRADITIONAL TURKHISH AYRAN :Yogurt" = "عيران تركي تقليدي"
}

function Get-ArabicName([string]$name, $translations) {
  if ($translations.ContainsKey($name)) { return $translations[$name] }
  return $name
}

$imagesPath = Join-Path $root "scripts/product-images.json"
$imagesMapping = @{}
if (Test-Path $imagesPath) {
  $jsonObj = Get-Content -Raw -LiteralPath $imagesPath | ConvertFrom-Json
  foreach ($prop in $jsonObj.PSObject.Properties) {
    $imagesMapping[$prop.Name] = $prop.Value
  }
}

$descriptionsPath = Join-Path $root "scripts/product-descriptions-ar.json"
$descriptionsMapping = @{}
if (Test-Path $descriptionsPath) {
  $jsonObj = Get-Content -Raw -LiteralPath $descriptionsPath | ConvertFrom-Json
  foreach ($prop in $jsonObj.PSObject.Properties) {
    $descriptionsMapping[$prop.Name] = $prop.Value
  }
}

$categories = @()
$products = @()
$productIndex = 1
$sheetNodes = $workbookXml.SelectNodes("//d:sheets/d:sheet", $ns)

for ($sheetIndex = 0; $sheetIndex -lt $sheetNodes.Count; $sheetIndex++) {
  $sheet = $sheetNodes[$sheetIndex]
  $sheetName = $sheet.GetAttribute("name")
  $categoryId = "c-mp-" + (Get-Slug $sheetName)
  $categoryImage = $imageByCategory[$sheetName]
  if ([string]::IsNullOrWhiteSpace($categoryImage)) {
    $categoryImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&q=80"
  }

  $categories += [pscustomobject]@{
    id = $categoryId
    tenantId = "t-1"
    nameEn = $sheetName
    nameAr = Get-ArabicName $sheetName $categoryArabicByName
    descriptionEn = "Imported from the Meatport $sheetName sheet"
    descriptionAr = "Imported from the Meatport $sheetName sheet"
    displayOrder = $sheetIndex + 1
    isVisible = $true
    parentId = $null
    imageUrl = $categoryImage
  }

  $target = $rels[$sheet.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")]
  $sheetXml = Load-Xml (Join-Path (Join-Path $extractDir "xl") $target)
  $rows = $sheetXml.SelectNodes("//*[local-name()='sheetData']/*[local-name()='row']")

  for ($rowIndex = 0; $rowIndex -lt $rows.Count; $rowIndex++) {
    $rowValues = Get-RowValues $rows[$rowIndex] $sharedStrings
    $marker = $rowValues[1]
    $rawName = $rowValues[2]
    $candidateCells = @(1..30 | ForEach-Object { $rowValues[$_] })

    if ($marker -match "^\s*\d+\s*-" -and [string]::IsNullOrWhiteSpace($rawName)) {
      $rawName = $marker
    }

    if (-not (Test-ProductRow $marker $rawName $candidateCells)) { continue }
    if ([string]::IsNullOrWhiteSpace($rawName)) { continue }

    $content = ""
    if ($rowIndex + 1 -lt $rows.Count) {
      $nextValues = Get-RowValues $rows[$rowIndex + 1] $sharedStrings
      $nextMarker = $nextValues[1]
      $nextName = $nextValues[2]
      $nextCells = @(1..30 | ForEach-Object { $nextValues[$_] })
      if ($nextMarker -eq "Content") {
        $content = if ([string]::IsNullOrWhiteSpace($nextName)) { Get-FirstText $nextValues } else { $nextName }
      } elseif (-not (Test-ProductRow $nextMarker $nextName $nextCells)) {
        $content = Get-FirstText $nextValues
      }
    }

    $name = Get-CleanName $rawName
    if ([string]::IsNullOrWhiteSpace($name)) { $name = $rawName.Trim() }
    $price = Get-Price $candidateCells
    $costPrice = [math]::Round($price * 0.4, 2)
    $profit = [math]::Round($price - $costPrice, 2)
    $margin = if ($price -gt 0) { [math]::Round(($profit / $price) * 100, 1) } else { 0 }
    $calories = Get-Calories $rawName
    $productId = "mp-p-" + $productIndex.ToString("000")
    $productImage = $null
    if ($imagesMapping.ContainsKey($productId)) {
      $productImage = $imagesMapping[$productId]
    }
    if ([string]::IsNullOrWhiteSpace($productImage)) {
      $productImage = $imageByCategory[$sheetName]
    }
    if ([string]::IsNullOrWhiteSpace($productImage)) {
      $productImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=450&fit=crop&q=80"
    }

    $products += [pscustomobject]@{
      id = $productId
      tenantId = "t-1"
      categoryId = $categoryId
      subCategoryId = $null
      nameEn = $name
      nameAr = Get-ArabicName $name $productArabicByName
      descriptionEn = if ([string]::IsNullOrWhiteSpace($content)) { $rawName.Trim() } else { $content.Trim() }
      descriptionAr = if ($descriptionsMapping.ContainsKey($productId)) { $descriptionsMapping[$productId] } else { if ([string]::IsNullOrWhiteSpace($content)) { $rawName.Trim() } else { $content.Trim() } }
      price = $price
      costPrice = $costPrice
      profit = $profit
      margin = $margin
      calories = $calories
      preparationTime = 15
      sku = "MP-" + $productIndex.ToString("000")
      barcode = $null
      imageUrl = $productImage
      videoUrl = $null
      displayOrder = $products.Where({ $_.categoryId -eq $categoryId }).Count + 1
      isVisible = $true
      isFeatured = $productIndex -le 6
      isRecommended = $productIndex -le 12
      isPopular = $productIndex -le 12
      trackStock = $false
      stockQuantity = 0
      recipeLink = $null
      allergens = @(Get-Allergens $rawName)
      nutrition = $null
      modifierGroupIds = @()
      sizes = @(
        [pscustomobject]@{
          id = "size-$productId-regular"
          nameEn = "Regular"
          nameAr = "Regular"
          priceDifference = 0
          calories = 0
          sku = "MP-" + $productIndex.ToString("000") + "-REG"
        }
      )
      taxRate = 0.15
      discountRate = 0
    }

    $productIndex++
  }
}

$catalogPath = Join-Path $root "src/meatportCatalog.ts"
$catalog = @"
import { Category, Product } from './types';

export const meatportCatalogVersion = 'meatport-imported-catalog-2026-07-12-ar-1';

export const meatportCategories: Category[] = $(ConvertTo-TsObject $categories 0);

export const meatportProducts: Product[] = $(ConvertTo-TsObject $products 0);
"@
[System.IO.File]::WriteAllText($catalogPath, $catalog, [System.Text.UTF8Encoding]::new($false))

$initialDataPath = Join-Path $root "src/initialData.ts"
$initialData = [System.IO.File]::ReadAllText($initialDataPath)
if ($initialData -notmatch "meatportCatalog") {
  $initialData = $initialData -replace "import \{ ([^}]+) \} from './types';", "import { `$1 } from './types';`r`nimport { meatportCategories, meatportProducts } from './meatportCatalog';"
}
$initialData = [regex]::Replace($initialData, "export const initialCategories: Category\[\] = \[[\s\S]*?\];\r?\n\r?\nexport const initialModifierGroups", "export const initialCategories: Category[] = meatportCategories;`r`n`r`nexport const initialModifierGroups")
$initialData = [regex]::Replace($initialData, "export const initialProducts: Product\[\] = \[[\s\S]*?\];\r?\n\r?\nexport const initialIngredients", "export const initialProducts: Product[] = meatportProducts;`r`n`r`nexport const initialIngredients")
[System.IO.File]::WriteAllText($initialDataPath, $initialData, [System.Text.UTF8Encoding]::new($false))

$dumpPath = Join-Path $root "public/tenants/meatport/database_dump.json"
$dump = Get-Content -Raw -LiteralPath $dumpPath | ConvertFrom-Json
$dump.categories = $categories
$dump.products = $products
$dump.recipes = @()
$dump.orderItems = @()
$dump | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $dumpPath -Encoding utf8

# Apply Arabic translations to the imported catalog
node (Join-Path $PSScriptRoot "apply-ar-translations.cjs")

Write-Output "Imported $($categories.Count) categories and $($products.Count) products for Meatport."


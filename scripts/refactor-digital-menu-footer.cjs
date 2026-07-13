const fs = require('fs');
const path = require('path');

console.log("Refactoring DigitalMenu.tsx footer texts...");
const menuPath = path.join(__dirname, '../src/components/DigitalMenu.tsx');
let menuContent = fs.readFileSync(menuPath, 'utf8');

// Normalize to LF
menuContent = menuContent.replace(/\r\n/g, '\n');

// 1. Slogan
const sloganSearch = `<p className="text-[9px] text-gray-400 font-semibold">{lang === 'ar' ? 'أفضل جودة وخدمة ممتازة' : 'Premium Quality & Experience'}</p>`;
const sloganReplace = `<p className="text-[9px] text-gray-400 font-semibold">{lang === 'ar' ? (tenant.sloganAr || 'أفضل جودة وخدمة ممتازة') : (tenant.sloganEn || 'Premium Quality & Experience')}</p>`;
menuContent = menuContent.replace(sloganSearch, sloganReplace);

// 2. Description
const descSearch = `            <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
              {lang === 'ar' 
                ? 'فخورون بتقديم أشهى المأكولات المعدة بحب وشغف طيلة أيام الأسبوع، مع خدمة سريعة وآمنة تماماً.'
                : 'Proudly serving handcrafted meals prepared with fresh ingredients, with clean contact-free pickup & delivery.'}
            </p>`;
const descReplace = `            <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
              {lang === 'ar' 
                ? (tenant.descAr || 'فخورون بتقديم أشهى المأكولات المعدة بحب وشغف طيلة أيام الأسبوع، مع خدمة سريعة وآمنة تماماً.')
                : (tenant.descEn || 'Proudly serving handcrafted meals prepared with fresh ingredients, with clean contact-free pickup & delivery.')}
            </p>`;
menuContent = menuContent.replace(descSearch, descReplace);

// 3. Hours
const hoursSearch = `            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
              <Clock className="w-3.5 h-3.5 text-[var(--tenant-primary)]" />
              <span>{lang === 'ar' ? 'ساعات العمل: ١٢ ظهراً - ١٢ ليلاً' : 'Opening Hours: 12 PM - 12 AM'}</span>
            </div>`;
const hoursReplace = `            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
              <Clock className="w-3.5 h-3.5 text-[var(--tenant-primary)]" />
              <span>{lang === 'ar' ? (tenant.hoursAr || 'ساعات العمل: ١٢ ظهراً - ١٢ ليلاً') : (tenant.hoursEn || 'Opening Hours: 12 PM - 12 AM')}</span>
            </div>`;
menuContent = menuContent.replace(hoursSearch, hoursReplace);

// 4. Support text
const supportSearch = `            <p className="text-[10px] text-gray-400 font-medium">
              {lang === 'ar'
                ? 'هل لديك أي استفسار أو ترغب في تقديم طلب خاص؟ تواصل معنا مباشرة:'
                : 'Have any questions or special orders? Contact our support channels directly:'}
            </p>`;
const supportReplace = `            <p className="text-[10px] text-gray-400 font-medium">
              {lang === 'ar'
                ? (tenant.supportAr || 'هل لديك أي استفسار أو ترغب في تقديم طلب خاص؟ تواصل معنا مباشرة:')
                : (tenant.supportEn || 'Have any questions or special orders? Contact our support channels directly:')}
            </p>`;
menuContent = menuContent.replace(supportSearch, supportReplace);

// 5. Social text
const socialSearch = `            <p className="text-[10px] text-gray-400 font-medium">
              {lang === 'ar'
                ? 'ابقَ على اطلاع بأحدث عروضنا الموسمية وأطباقنا الجديدة وخصوماتنا الحصرية.'
                : 'Stay tuned for seasonal discounts, new menu arrivals, and exclusive promos.'}
            </p>`;
const socialReplace = `            <p className="text-[10px] text-gray-400 font-medium">
              {lang === 'ar'
                ? (tenant.socialAr || 'ابقَ على اطلاع بأحدث عروضنا الموسمية وأطباقنا الجديدة وخصوماتنا الحصرية.')
                : (tenant.socialEn || 'Stay tuned for seasonal discounts, new menu arrivals, and exclusive promos.')}
            </p>`;
menuContent = menuContent.replace(socialSearch, socialReplace);

// 6. Handle
const handleSearch = `            <div className="pt-2 text-[9px] text-gray-500 font-mono">
              <span>{lang === 'ar' ? 'المعرف الرسمي:' : 'Branded Handle:'}</span>
              <span className="block font-bold text-gray-450">@{tenant.slug}.restaurant</span>
            </div>`;
const handleReplace = `            <div className="pt-2 text-[9px] text-gray-500 font-mono">
              <span>{lang === 'ar' ? 'المعرف الرسمي:' : 'Branded Handle:'}</span>
              <span className="block font-bold text-gray-450">{tenant.handle || \`@\${tenant.slug}.restaurant\`}</span>
            </div>`;
menuContent = menuContent.replace(handleSearch, handleReplace);

// 7. Copyright
const copyrightSearch = `          <p>
            {lang === 'ar'
              ? \`جميع الحقوق محفوظة © ٢٠٢٦ للمطعم الفاخر \${tenant.nameAr}. مدعوم بواسطة نظام فوديكس SaaS.\`
              : \`All Rights Reserved © 2026 for \${tenant.nameEn}. Powered by Foodics SaaS Monolith System.\`}
          </p>`;
const copyrightReplace = `          <p>
            {lang === 'ar'
              ? (tenant.copyrightAr || \`جميع الحقوق محفوظة © ٢٠٢٦ للمطعم الفاخر \${tenant.nameAr}. مدعوم بواسطة نظام فوديكس SaaS.\`)
              : (tenant.copyrightEn || \`All Rights Reserved © 2026 for \${tenant.nameEn}. Powered by Foodics SaaS Monolith System.\`)}
          </p>`;
menuContent = menuContent.replace(copyrightSearch, copyrightReplace);

fs.writeFileSync(menuPath, menuContent, 'utf8');
console.log("DigitalMenu footer refactor successfully applied!");

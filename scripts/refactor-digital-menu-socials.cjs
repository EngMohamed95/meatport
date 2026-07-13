const fs = require('fs');
const path = require('path');

console.log("Refactoring DigitalMenu.tsx social links and copyright...");
const menuPath = path.join(__dirname, '../src/components/DigitalMenu.tsx');
let menuContent = fs.readFileSync(menuPath, 'utf8');

// Normalize to LF
menuContent = menuContent.replace(/\r\n/g, '\n');

// 1. WhatsApp support button
const waSupportSearch = `              {/* WhatsApp Button */}
              <a 
                href={\`https://wa.me/\${tenant.phone ? tenant.phone.replace(/[^0-9]/g, '') : '966500000000'}\`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-550/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black transition border border-emerald-500/20"
              >`;
const waSupportReplace = `              {/* WhatsApp Button */}
              <a 
                href={\`https://wa.me/\${tenant.whatsappNumber ? tenant.whatsappNumber.replace(/[^0-9]/g, '') : (tenant.phone ? tenant.phone.replace(/[^0-9]/g, '') : '966500000000')}\`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-550/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black transition border border-emerald-500/20"
              >`;
menuContent = menuContent.replace(waSupportSearch, waSupportReplace);

// 2. Instagram Link
const instaSearch = `              {/* Instagram */}
              <a 
                href={\`https://instagram.com/\${tenant.slug}\`} `;
const instaReplace = `              {/* Instagram */}
              <a 
                href={tenant.instagramUrl || \`https://instagram.com/\${tenant.slug}\`} `;
menuContent = menuContent.replace(instaSearch, instaReplace);

// 3. Facebook Link
const fbSearch = `              {/* Facebook */}
              <a 
                href={\`https://facebook.com/\${tenant.slug}\`}`;
const fbReplace = `              {/* Facebook */}
              <a 
                href={tenant.facebookUrl || \`https://facebook.com/\${tenant.slug}\`}`;
menuContent = menuContent.replace(fbSearch, fbReplace);

// 4. WhatsApp Channel Link
const waChannelSearch = `              {/* WhatsApp Icon for channel */}
              <a 
                href={\`https://wa.me/\${tenant.phone ? tenant.phone.replace(/[^0-9]/g, '') : '966500000000'}\`}`;
const waChannelReplace = `              {/* WhatsApp Icon for channel */}
              <a 
                href={\`https://wa.me/\${tenant.whatsappNumber ? tenant.whatsappNumber.replace(/[^0-9]/g, '') : (tenant.phone ? tenant.phone.replace(/[^0-9]/g, '') : '966500000000')}\`}`;
menuContent = menuContent.replace(waChannelSearch, waChannelReplace);

// 5. Twitter / X Link
const twitterSearch = `              {/* Twitter / X */}
              <a 
                href={\`https://twitter.com/\${tenant.slug}\`}`;
const twitterReplace = `              {/* Twitter / X */}
              <a 
                href={tenant.twitterUrl || \`https://x.com/\${tenant.slug}\`}`;
menuContent = menuContent.replace(twitterSearch, twitterReplace);

// 6. Copyright (Static/Dynamic with Tenant name, no override needed)
const copyrightSearch = `          <p>
            {lang === 'ar'
              ? (tenant.copyrightAr || \`جميع الحقوق محفوظة © ٢٠٢٦ للمطعم الفاخر \${tenant.nameAr}. مدعوم بواسطة نظام فوديكس SaaS.\`)
              : (tenant.copyrightEn || \`All Rights Reserved © 2026 for \${tenant.nameEn}. Powered by Foodics SaaS Monolith System.\`)}
          </p>`;
const copyrightReplace = `          <p>
            {lang === 'ar'
              ? \`جميع الحقوق محفوظة © ٢٠٢٦ لـ \${tenant.nameAr}. مدعوم بواسطة نظام فوديكس SaaS.\`
              : \`All Rights Reserved © 2026 for \${tenant.nameEn}. Powered by Foodics SaaS Monolith System.\`}
          </p>`;
menuContent = menuContent.replace(copyrightSearch, copyrightReplace);

fs.writeFileSync(menuPath, menuContent, 'utf8');
console.log("DigitalMenu socials and copyright refactor completed successfully!");

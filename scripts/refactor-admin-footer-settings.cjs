const fs = require('fs');
const path = require('path');

console.log("Refactoring AdminDashboard.tsx to add footer text settings controls...");
const adminPath = path.join(__dirname, '../src/components/AdminDashboard.tsx');
let adminContent = fs.readFileSync(adminPath, 'utf8');

// Normalize to LF
adminContent = adminContent.replace(/\r\n/g, '\n');

const contactCardSearch = `              {/* Phone & Address Contact details */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150/45 dark:border-gray-800/40 space-y-4 text-right">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 dark:text-white block">
                    {lang === 'ar' ? 'رقم الهاتف الموحد للمتجر' : 'Unified Brand Phone'}
                  </label>
                  <input
                    type="text"
                    value={tenant.phone || ''}
                    onChange={(e) => {
                      const newPhone = e.target.value;
                      if (setTenants) {
                        setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, phone: newPhone } : t));
                      }
                      if (setBranches && branches.length > 0) {
                        setBranches(prev => prev.map((b, idx) => idx === 0 ? { ...b, phone: newPhone } : b));
                      }
                    }}
                    placeholder="+966 50 000 0000"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-800 dark:text-white block">
                      {lang === 'ar' ? 'عنوان الفرع الرئيسي (بالعربية)' : 'Main Branch Address (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={branches[0]?.addressAr || ''}
                      onChange={(e) => {
                        const newAddress = e.target.value;
                        if (setBranches && branches.length > 0) {
                          setBranches(prev => prev.map((b, idx) => idx === 0 ? { ...b, addressAr: newAddress } : b));
                        }
                      }}
                      placeholder="شارع العليا، الرياض، المملكة العربية السعودية"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-800 dark:text-white block">
                      {lang === 'ar' ? 'عنوان الفرع الرئيسي (بالإنجليزية)' : 'Main Branch Address (English)'}
                    </label>
                    <input
                      type="text"
                      value={branches[0]?.addressEn || ''}
                      onChange={(e) => {
                        const newAddress = e.target.value;
                        if (setBranches && branches.length > 0) {
                          setBranches(prev => prev.map((b, idx) => idx === 0 ? { ...b, addressEn: newAddress } : b));
                        }
                      }}
                      placeholder="Olaya Street, Riyadh, KSA"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-80 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>`;

const contactCardReplace = `              {/* Phone & Address Contact details */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150/45 dark:border-gray-800/40 space-y-4 text-right">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 dark:text-white block">
                    {lang === 'ar' ? 'رقم الهاتف الموحد للمتجر' : 'Unified Brand Phone'}
                  </label>
                  <input
                    type="text"
                    value={tenant.phone || ''}
                    onChange={(e) => {
                      const newPhone = e.target.value;
                      if (setTenants) {
                        setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, phone: newPhone } : t));
                      }
                      if (setBranches && branches.length > 0) {
                        setBranches(prev => prev.map((b, idx) => idx === 0 ? { ...b, phone: newPhone } : b));
                      }
                    }}
                    placeholder="+966 50 000 0000"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-800 dark:text-white block">
                      {lang === 'ar' ? 'عنوان الفرع الرئيسي (بالعربية)' : 'Main Branch Address (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={branches[0]?.addressAr || ''}
                      onChange={(e) => {
                        const newAddress = e.target.value;
                        if (setBranches && branches.length > 0) {
                          setBranches(prev => prev.map((b, idx) => idx === 0 ? { ...b, addressAr: newAddress } : b));
                        }
                      }}
                      placeholder="شارع العليا، الرياض، المملكة العربية السعودية"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-800 dark:text-white block">
                      {lang === 'ar' ? 'عنوان الفرع الرئيسي (بالإنجليزية)' : 'Main Branch Address (English)'}
                    </label>
                    <input
                      type="text"
                      value={branches[0]?.addressEn || ''}
                      onChange={(e) => {
                        const newAddress = e.target.value;
                        if (setBranches && branches.length > 0) {
                          setBranches(prev => prev.map((b, idx) => idx === 0 ? { ...b, addressEn: newAddress } : b));
                        }
                      }}
                      placeholder="Olaya Street, Riyadh, KSA"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-80 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Customization Fields */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150/45 dark:border-gray-800/40 space-y-4 text-right">
                <div>
                  <h5 className="text-xs font-bold text-gray-800 dark:text-white">
                    {lang === 'ar' ? 'تخصيص نصوص الفوتر' : 'Footer Content Customization'}
                  </h5>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {lang === 'ar' ? 'تعديل كافة نصوص الفوتر في المنيو الرقمي للعملاء.' : 'Modify all text and description items rendered in the customer menu footer.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Slogan */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'شعار المتجر القصير (عربي)' : 'Brand Slogan (Arabic)'}</label>
                    <input
                      type="text"
                      value={tenant.sloganAr || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, sloganAr: e.target.value } : t));
                        }
                      }}
                      placeholder="أفضل جودة وخدمة ممتازة"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'شعار المتجر القصير (إنجليزي)' : 'Brand Slogan (English)'}</label>
                    <input
                      type="text"
                      value={tenant.sloganEn || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, sloganEn: e.target.value } : t));
                        }
                      }}
                      placeholder="Premium Quality & Experience"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
                      dir="ltr"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'وصف المتجر في الفوتر (عربي)' : 'Footer Description (Arabic)'}</label>
                    <textarea
                      value={tenant.descAr || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, descAr: e.target.value } : t));
                        }
                      }}
                      placeholder="فخورون بتقديم أشهى المأكولات المعدة بحب وشغف طيلة أيام الأسبوع..."
                      rows={2}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs resize-none"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'وصف المتجر في الفوتر (إنجليزي)' : 'Footer Description (English)'}</label>
                    <textarea
                      value={tenant.descEn || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, descEn: e.target.value } : t));
                        }
                      }}
                      placeholder="Proudly serving handcrafted meals prepared with fresh ingredients..."
                      rows={2}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs resize-none text-left"
                      dir="ltr"
                    />
                  </div>

                  {/* Hours */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'أوقات العمل (عربي)' : 'Opening Hours (Arabic)'}</label>
                    <input
                      type="text"
                      value={tenant.hoursAr || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, hoursAr: e.target.value } : t));
                        }
                      }}
                      placeholder="ساعات العمل: ١٢ ظهراً - ١٢ ليلاً"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'أوقات العمل (إنجليزي)' : 'Opening Hours (English)'}</label>
                    <input
                      type="text"
                      value={tenant.hoursEn || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, hoursEn: e.target.value } : t));
                        }
                      }}
                      placeholder="Opening Hours: 12 PM - 12 AM"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
                      dir="ltr"
                    />
                  </div>

                  {/* Support Message */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'نص خدمة العملاء (عربي)' : 'Support Callout (Arabic)'}</label>
                    <input
                      type="text"
                      value={tenant.supportAr || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, supportAr: e.target.value } : t));
                        }
                      }}
                      placeholder="هل لديك أي استفسار أو ترغب في تقديم طلب خاص؟ تواصل معنا مباشرة"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'نص خدمة العملاء (إنجليزي)' : 'Support Callout (English)'}</label>
                    <input
                      type="text"
                      value={tenant.supportEn || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, supportEn: e.target.value } : t));
                        }
                      }}
                      placeholder="Have any questions or special orders? Contact our support channels directly"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
                      dir="ltr"
                    />
                  </div>

                  {/* Social Message */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'نص وسائل التواصل الاجتماعي (عربي)' : 'Social Callout (Arabic)'}</label>
                    <input
                      type="text"
                      value={tenant.socialAr || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, socialAr: e.target.value } : t));
                        }
                      }}
                      placeholder="ابقَ على اطلاع بأحدث عروضنا الموسمية وأطباقنا الجديدة..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'نص وسائل التواصل الاجتماعي (إنجليزي)' : 'Social Callout (English)'}</label>
                    <input
                      type="text"
                      value={tenant.socialEn || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, socialEn: e.target.value } : t));
                        }
                      }}
                      placeholder="Stay tuned for seasonal discounts, new menu arrivals..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
                      dir="ltr"
                    />
                  </div>

                  {/* Handle & Copyright */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'المعرف الرقمي للموقع (Social Handle)' : 'Branded Social Handle'}</label>
                    <input
                      type="text"
                      value={tenant.handle || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, handle: e.target.value } : t));
                        }
                      }}
                      placeholder="@meatport.restaurant"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'نص حقوق الملكية (عربي)' : 'Copyright Text (Arabic)'}</label>
                    <input
                      type="text"
                      value={tenant.copyrightAr || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, copyrightAr: e.target.value } : t));
                        }
                      }}
                      placeholder="جميع الحقوق محفوظة © ٢٠٢٦ للمطعم الفاخر Meatport..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>
                  
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'نص حقوق الملكية (إنجليزي)' : 'Copyright Text (English)'}</label>
                    <input
                      type="text"
                      value={tenant.copyrightEn || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, copyrightEn: e.target.value } : t));
                        }
                      }}
                      placeholder="All Rights Reserved © 2026 for Meatport. Powered by Foodics..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>`;

if (adminContent.includes(contactCardSearch)) {
  adminContent = adminContent.replace(contactCardSearch, contactCardReplace);
  fs.writeFileSync(adminPath, adminContent, 'utf8');
  console.log("Footer customization controls successfully added to Settings panel!");
} else {
  console.log("WARNING: Could not locate unified brand phone inputs section to attach footer text overrides.");
}

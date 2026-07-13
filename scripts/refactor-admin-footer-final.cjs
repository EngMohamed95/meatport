const fs = require('fs');
const path = require('path');

console.log("Refactoring AdminDashboard.tsx to implement branch editor, social links, and clean copyright settings...");
const adminPath = path.join(__dirname, '../src/components/AdminDashboard.tsx');
let adminContent = fs.readFileSync(adminPath, 'utf8');

// Normalize to LF
adminContent = adminContent.replace(/\r\n/g, '\n');

const oldCardsSearch = `              {/* Phone & Address Contact details */}
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

const contactCardReplace = `              {/* Multiple Branches & Locations Management */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150/45 dark:border-gray-800/40 space-y-4 text-right">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100/10">
                  <div>
                    <h5 className="text-xs font-bold text-gray-850 dark:text-white">
                      {lang === 'ar' ? 'إدارة الفروع وعناوينها (أكثر من عنوان ورقم)' : 'Branches & Locations Editor'}
                    </h5>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      {lang === 'ar' ? 'يمكنك إضافة فروع متعددة مع عناوين باللغتين وأرقام هواتف منفصلة للفوتر.' : 'Add, edit or remove multiple branch locations and contact details.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (setBranches) {
                        const newId = \`b-\${Date.now()}\`;
                        setBranches(prev => [
                          ...prev,
                          {
                            id: newId,
                            tenantId: tenant.id,
                            nameEn: 'New Branch Location',
                            nameAr: 'فرع جديد للمطعم',
                            addressEn: 'Main Street Address',
                            addressAr: 'عنوان تفصيلي للفرع',
                            phone: tenant.phone || '',
                            isActive: true
                          }
                        ]);
                      }
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                  >
                    + {lang === 'ar' ? 'إضافة فرع جديد' : 'Add New Branch'}
                  </button>
                </div>

                <div className="space-y-3.5 pt-2 max-h-[400px] overflow-y-auto pr-1">
                  {branches.filter(b => b.tenantId === tenant.id).map((branch, index) => (
                    <div key={branch.id} className="p-3 bg-white dark:bg-gray-850 rounded-xl border border-gray-150/20 dark:border-gray-800 space-y-3 relative shadow-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100/10">
                        <span className="text-[10px] font-bold text-rose-600">
                          {lang === 'ar' ? \`الفرع \${index + 1}\` : \`Location \${index + 1}\`}
                        </span>
                        {branches.filter(b => b.tenantId === tenant.id).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (setBranches) {
                                setBranches(prev => prev.filter(b => b.id !== branch.id));
                              }
                            }}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold transition"
                          >
                            {lang === 'ar' ? 'حذف الفرع' : 'Remove Branch'}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-500">{lang === 'ar' ? 'اسم الفرع (عربي)' : 'Branch Name (AR)'}</label>
                          <input
                            type="text"
                            value={branch.nameAr}
                            onChange={(e) => {
                              if (setBranches) {
                                setBranches(prev => prev.map(b => b.id === branch.id ? { ...b, nameAr: e.target.value } : b));
                              }
                            }}
                            className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-500">{lang === 'ar' ? 'اسم الفرع (إنجليزي)' : 'Branch Name (EN)'}</label>
                          <input
                            type="text"
                            value={branch.nameEn}
                            onChange={(e) => {
                              if (setBranches) {
                                setBranches(prev => prev.map(b => b.id === branch.id ? { ...b, nameEn: e.target.value } : b));
                              }
                            }}
                            className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
                            dir="ltr"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-500">{lang === 'ar' ? 'عنوان الفرع (عربي)' : 'Address (AR)'}</label>
                          <input
                            type="text"
                            value={branch.addressAr}
                            onChange={(e) => {
                              if (setBranches) {
                                setBranches(prev => prev.map(b => b.id === branch.id ? { ...b, addressAr: e.target.value } : b));
                              }
                            }}
                            className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-500">{lang === 'ar' ? 'عنوان الفرع (إنجليزي)' : 'Address (EN)'}</label>
                          <input
                            type="text"
                            value={branch.addressEn}
                            onChange={(e) => {
                              if (setBranches) {
                                setBranches(prev => prev.map(b => b.id === branch.id ? { ...b, addressEn: e.target.value } : b));
                              }
                            }}
                            className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
                            dir="ltr"
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold text-gray-500">{lang === 'ar' ? 'رقم الهاتف المخصص للفرع' : 'Branch Phone Number'}</label>
                          <input
                            type="text"
                            value={branch.phone}
                            onChange={(e) => {
                              if (setBranches) {
                                setBranches(prev => prev.map(b => b.id === branch.id ? { ...b, phone: e.target.value } : b));
                              }
                            }}
                            placeholder="+966 50 123 4567"
                            className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left font-mono"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media Links & Chat Customization */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150/45 dark:border-gray-800/40 space-y-4 text-right">
                <div>
                  <h5 className="text-xs font-bold text-gray-800 dark:text-white">
                    {lang === 'ar' ? 'روابط التواصل الاجتماعي ورقم الواتساب' : 'Social Channels & WhatsApp'}
                  </h5>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {lang === 'ar' ? 'تعديل روابط منصات التواصل ورقم الواتساب للربط التلقائي في المنيو.' : 'Update social channel links and support WhatsApp number.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'رقم الواتساب للمتجر' : 'WhatsApp Chat Number'}</label>
                    <input
                      type="text"
                      value={tenant.whatsappNumber || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, whatsappNumber: e.target.value } : t));
                        }
                      }}
                      placeholder="966500000000"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'رابط حساب الانستجرام (Instagram)' : 'Instagram URL'}</label>
                    <input
                      type="text"
                      value={tenant.instagramUrl || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, instagramUrl: e.target.value } : t));
                        }
                      }}
                      placeholder="https://instagram.com/yourbrand"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'رابط حساب الفيسبوك (Facebook)' : 'Facebook URL'}</label>
                    <input
                      type="text"
                      value={tenant.facebookUrl || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, facebookUrl: e.target.value } : t));
                        }
                      }}
                      placeholder="https://facebook.com/yourbrand"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{lang === 'ar' ? 'رابط حساب تويتر / إكس (Twitter/X)' : 'Twitter / X URL'}</label>
                    <input
                      type="text"
                      value={tenant.twitterUrl || ''}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, twitterUrl: e.target.value } : t));
                        }
                      }}
                      placeholder="https://x.com/yourbrand"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
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
                    {lang === 'ar' ? 'تعديل نصوص الفوتر التعريفية وساعات العمل في المنيو الرقمي للعملاء.' : 'Modify slogan, description and opening hours rendered in the footer.'}
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

                  {/* Handle */}
                  <div className="space-y-1.5 md:col-span-2">
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
                </div>
              </div>`;

if (adminContent.includes(oldCardsSearch)) {
  adminContent = adminContent.replace(oldCardsSearch, contactCardReplace);
  fs.writeFileSync(adminPath, adminContent, 'utf8');
  console.log("Footer contact card successfully updated with dynamic multi-branch settings!");
} else {
  console.log("WARNING: Could not locate expected settings contactCardSearch in AdminDashboard.tsx to update.");
}

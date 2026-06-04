import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const arText = {
  Back: "رجوع",
  Dashboard: "لوحة التحكم",
  Refresh: "تحديث",
  Search: "بحث",
  Cancel: "إلغاء",
  Delete: "حذف",
  Save: "حفظ",
  Edit: "تعديل",
  Active: "نشط",
  Inactive: "غير نشط",
  Blocked: "محظور",
  Suspended: "موقوف",
  Pending: "قيد الانتظار",
  Processing: "قيد المعالجة",
  Completed: "مكتمل",
  Delivered: "تم التسليم",
  Cancelled: "ملغي",
  Approved: "مقبول",
  Rejected: "مرفوض",
  Unknown: "غير معروف",
  Vendor: "بائع",
  Customer: "عميل",
  Admin: "مسؤول",
  "N/A": "غير متاح",
  "Sign In": "تسجيل الدخول",
  "Back to Cart": "العودة إلى السلة",
  "Payment Method": "طريقة الدفع",
  "Choose how you'd like to pay": "اختر طريقة الدفع المناسبة لك",
  "Select Payment Method": "اختر طريقة الدفع",
  "Card Payment": "الدفع بالبطاقة",
  "Pay securely with your credit or debit card": "ادفع بأمان باستخدام بطاقة الائتمان أو الخصم",
  "Cash on Delivery": "الدفع عند التوصيل",
  "Pay with cash when your order is delivered": "ادفع نقدا عند استلام الطلب",
  "Cash on Pickup": "الدفع عند الاستلام",
  "Pay with cash when you collect your order": "ادفع نقدا عند استلام الطلب",
  "Order Summary": "ملخص الطلب",
  Subtotal: "المجموع الفرعي",
  "Delivery Fee": "رسوم التوصيل",
  "Service Fee (6%)": "رسوم الخدمة (6%)",
  Total: "الإجمالي",
  "Confirm Order": "تأكيد الطلب",
  "Placing Order...": "جاري إرسال الطلب...",
  "Review Your Order": "راجع طلبك",
  Skip: "تخطي",
  "Order Details": "تفاصيل الطلب",
  Confirm: "تأكيد",
  "Delivery Method": "طريقة الاستلام",
  "Home Delivery": "توصيل للمنزل",
  "Pickup from Restaurant": "استلام من المطعم",
  "Estimated Time": "الوقت المتوقع",
  "Delivery Address": "عنوان التوصيل",
  "Pickup Location": "موقع الاستلام",
  Items: "العناصر",
  "Your saved address": "عنوانك المحفوظ",
  "Restaurant address shown in app": "عنوان المطعم الموضح في التطبيق",
  "Everything looks good?": "كل شيء يبدو صحيحا؟",
  "Order Confirmed!": "تم تأكيد الطلب!",
  "Your order has been placed successfully": "تم إرسال طلبك بنجاح",
  Payment: "الدفع",
  "Track Order": "تتبع الطلب",
  "Log Out?": "تسجيل الخروج؟",
  "Are you sure you want to log out?": "هل أنت متأكد أنك تريد تسجيل الخروج؟",
  "Yes, Log Out": "نعم، تسجيل الخروج",
  "Set your location": "حدد موقعك",
  "Quick Links": "روابط سريعة",
  FAQ: "الأسئلة الشائعة",
  "Privacy Policy": "سياسة الخصوصية",
  "Terms & Conditions": "الشروط والأحكام",
  "Reducing food waste, one meal at a time. Save food, save money, save the planet.": "نقلل هدر الطعام، وجبة بعد وجبة. أنقذ الطعام، وفر المال، واحم الكوكب.",
  Contact: "التواصل",
  "Cairo, Egypt": "القاهرة، مصر",
  "Made with": "صنع بـ",
  "for a greener planet 🌱": "من أجل كوكب أكثر خضرة 🌱",
  "All rights reserved.": "جميع الحقوق محفوظة.",
  "Review Report": "مراجعة البلاغ",
  "Reports & Issues": "البلاغات والمشاكل",
  "User Management": "إدارة المستخدمين",
  "Manage customers & vendors": "إدارة العملاء والبائعين",
  "Total Users": "إجمالي المستخدمين",
  "All Users": "كل المستخدمين",
  Users: "المستخدمون",
  User: "المستخدم",
  Email: "البريد الإلكتروني",
  Type: "النوع",
  Status: "الحالة",
  Joined: "تاريخ الانضمام",
  Actions: "الإجراءات",
  "All Statuses": "كل الحالات",
  "All Types": "كل الأنواع",
  "No users found.": "لا يوجد مستخدمون.",
  "Loading users...": "جاري تحميل المستخدمين...",
  "Loading users...": "جاري تحميل المستخدمين...",
  "Loading is taking longer than expected...": "التحميل يستغرق وقتا أطول من المتوقع...",
  "Delete User?": "حذف المستخدم؟",
  "This action cannot be undone.": "لا يمكن التراجع عن هذا الإجراء.",
  "Block User": "حظر المستخدم",
  "Unblock User": "رفع الحظر",
  "Delete User": "حذف المستخدم",
  Vendors: "البائعون",
  "Frequently Asked Questions": "الأسئلة الشائعة",
  "Everything you need to know about ZeroWaste": "كل ما تحتاج معرفته عن ZeroWaste",
  General: "عام",
  "Orders & Delivery": "الطلبات والتوصيل",
  Payments: "الدفع",
  "Accounts & Profile": "الحساب والملف الشخصي",
  Sustainability: "الاستدامة",
  "For Businesses": "للأعمال",
  All: "الكل",
  Restaurant: "مطعم",
  Bakery: "مخبز",
  Cafe: "مقهى",
  Supermarket: "سوبر ماركت",
  Hotel: "فندق",
  Others: "أخرى",
  "Highest Discount": "أعلى خصم",
  Distance: "المسافة",
  Rating: "التقييم",
  "Still have questions?": "ما زالت لديك أسئلة؟",
  "Our team is happy to help you.": "فريقنا سعيد بمساعدتك.",
  "Contact Us": "تواصل معنا",
  "What is ZeroWaste?": "ما هو ZeroWaste؟",
  "ZeroWaste is a platform that connects customers with local restaurants, bakeries, cafes, and supermarkets to purchase surplus food at discounted prices â€” reducing food waste and saving money at the same time.": "ZeroWaste منصة تربط العملاء بالمطاعم والمخابز والمقاهي والسوبر ماركت المحلية لشراء فائض الطعام بأسعار مخفضة، مما يقلل هدر الطعام ويوفر المال في نفس الوقت.",
  "How does ZeroWaste work?": "كيف يعمل ZeroWaste؟",
  "Businesses list their surplus food as discounted offers on the platform. Customers browse available offers nearby, add items to their cart, and either pick them up or have them delivered.": "تعرض الأعمال فائض الطعام كعروض مخفضة على المنصة. يتصفح العملاء العروض القريبة، يضيفونها إلى السلة، ثم يستلمونها أو يطلبون توصيلها.",
  "Is ZeroWaste available in my area?": "هل ZeroWaste متاح في منطقتي؟",
  "ZeroWaste currently operates in the Greater Cairo area, including Cairo, Giza, and Qalyubia governorates. We are continuously expanding to new areas.": "يعمل ZeroWaste حاليا في منطقة القاهرة الكبرى، بما يشمل القاهرة والجيزة والقليوبية، ونتوسع باستمرار إلى مناطق جديدة.",
  "Can I choose between pickup and delivery?": "هل يمكنني الاختيار بين الاستلام والتوصيل؟",
  "Yes! When placing an order, you can choose to pick it up directly from the restaurant or have it delivered to your location. Delivery is subject to a small fee.": "نعم، عند إتمام الطلب يمكنك اختيار الاستلام من المطعم مباشرة أو التوصيل إلى موقعك. قد تطبق رسوم توصيل بسيطة.",
  "How do I track my order?": "كيف أتتبع طلبي؟",
  "After placing an order, a tracking strip will appear on the home page showing the real-time status of your order â€” from confirmation to delivery or pickup.": "بعد إرسال الطلب سيظهر شريط تتبع في الصفحة الرئيسية يعرض حالة طلبك لحظة بلحظة، من التأكيد حتى التوصيل أو الاستلام.",
  "Can I cancel my order?": "هل يمكنني إلغاء طلبي؟",
  "You can cancel your order before it is accepted by the vendor. Once the vendor starts preparing your order, cancellation may not be possible.": "يمكنك إلغاء الطلب قبل قبوله من البائع. بعد أن يبدأ البائع في التحضير قد لا يكون الإلغاء متاحا.",
  "What if my order is cancelled by the vendor?": "ماذا لو ألغى البائع طلبي؟",
  "If the vendor cancels your order, you will be notified immediately and the order strip on your home page will reflect the cancellation.": "إذا ألغى البائع طلبك، سيتم إشعارك فورا وسيظهر ذلك في شريط الطلب على الصفحة الرئيسية.",
  "What payment methods are accepted?": "ما طرق الدفع المقبولة؟",
  "We currently accept cash on delivery and cash on pickup. Card payment is also available for online transactions.": "نقبل حاليا الدفع نقدا عند التوصيل أو الاستلام، كما يتوفر الدفع بالبطاقة للمعاملات الإلكترونية.",
  "Are the prices final or are there extra fees?": "هل الأسعار نهائية أم توجد رسوم إضافية؟",
  "The price shown includes the discounted offer price. A delivery fee may apply if you choose home delivery. No hidden charges.": "السعر المعروض يشمل سعر العرض بعد الخصم. قد تطبق رسوم توصيل إذا اخترت التوصيل للمنزل، ولا توجد رسوم مخفية.",
  "Do I need an account to browse offers?": "هل أحتاج إلى حساب لتصفح العروض؟",
  "You can browse offers without an account. However, to place orders, add favorites, or leave reviews, you need to sign in.": "يمكنك تصفح العروض بدون حساب، لكن لإرسال الطلبات أو إضافة المفضلة أو كتابة تقييمات يجب تسجيل الدخول.",
  "How do I update my profile information?": "كيف أحدث بيانات حسابي؟",
  "Go to your profile page from the navigation bar and update your details including name, email, and password.": "اذهب إلى صفحة حسابك من شريط التنقل وحدّث بياناتك مثل الاسم والبريد الإلكتروني وكلمة المرور.",
  "How do I delete my account?": "كيف أحذف حسابي؟",
  "You can delete your account from the profile settings page. Please note that this action is permanent and cannot be undone.": "يمكنك حذف حسابك من إعدادات الملف الشخصي. يرجى الانتباه إلى أن هذا الإجراء دائم ولا يمكن التراجع عنه.",
  "How does ZeroWaste help the environment?": "كيف يساعد ZeroWaste البيئة؟",
  "Every order on ZeroWaste rescues food that would otherwise go to waste, reducing COâ‚‚ emissions and helping fight climate change. You can track your personal sustainability impact on your home page.": "كل طلب على ZeroWaste ينقذ طعاما كان سيهدر، مما يقلل انبعاثات CO2 ويساعد في مواجهة تغير المناخ. يمكنك متابعة أثرك الشخصي في الاستدامة من الصفحة الرئيسية.",
  "What is the Sustainability Impact section?": "ما هو قسم أثر الاستدامة؟",
  "The Sustainability Impact section shows you how many meals you have rescued, how much COâ‚‚ you have helped prevent, and how much money you have saved â€” all through your orders on ZeroWaste.": "يعرض قسم أثر الاستدامة عدد الوجبات التي أنقذتها، وكمية CO2 التي ساعدت في تجنبها، والمال الذي وفرته من خلال طلباتك على ZeroWaste.",
  "How can my business join ZeroWaste?": "كيف يمكن لعملي الانضمام إلى ZeroWaste؟",
  "Register as a vendor on our platform, complete your business setup, and submit your documents for verification. Once approved, you can start listing your surplus food offers.": "سجل كبائع على المنصة، أكمل إعداد بيانات عملك، وأرسل مستنداتك للمراجعة. بعد الموافقة يمكنك البدء في عرض فائض الطعام.",
  "What types of businesses can join?": "ما أنواع الأعمال التي يمكنها الانضمام؟",
  "Restaurants, bakeries, cafes, supermarkets, hotels, and any food business with surplus food are welcome to join ZeroWaste.": "يمكن للمطاعم والمخابز والمقاهي والسوبر ماركت والفنادق وأي عمل غذائي لديه فائض طعام الانضمام إلى ZeroWaste.",
  "How do I manage my offers and orders?": "كيف أدير عروضي وطلباتي؟",
  "Through your vendor dashboard, you can add, edit, and manage your offers, track incoming orders, and view your sales reports and sustainability impact.": "من خلال لوحة تحكم البائع يمكنك إضافة العروض وتعديلها وإدارتها، وتتبع الطلبات الواردة، وعرض تقارير المبيعات وأثر الاستدامة.",
  "Zero Waste, Maximum Taste": "صفر هدر، أقصى مذاق",
  "Save Food,": "أنقذ الطعام،",
  "Save Money": "وفر المال",
  "Discover amazing food deals from local restaurants and reduce food waste": "اكتشف عروض طعام رائعة من مطاعم محلية وساهم في تقليل هدر الطعام",
  "Recommended For You": "مقترح لك",
  "Based on your interests and previous orders": "بناء على اهتماماتك وطلباتك السابقة",
  "Filter :": "تصفية:",
  "Sort by:": "ترتيب حسب:",
  Sort: "ترتيب",
  "Set your location first": "حدد موقعك أولا",
  "All Offers": "كل العروض",
  available: "متاح",
  "Loading offers...": "جاري تحميل العروض...",
  "Error Loading Offers": "خطأ في تحميل العروض",
  Retry: "إعادة المحاولة",
  "No Offers Found": "لا توجد عروض",
  "Try a different search term.": "جرب كلمة بحث مختلفة.",
  "No offers available right now.": "لا توجد عروض متاحة حاليا.",
  "Untitled Offer": "عرض بدون عنوان",
  "No description available": "لا يوجد وصف متاح",
  left: "متبقي",
  "Location Required": "الموقع مطلوب",
  "Please set your location first before adding items to your cart.": "يرجى تحديد موقعك أولا قبل إضافة عناصر إلى السلة.",
  OK: "موافق",
  "Sign In Required": "تسجيل الدخول مطلوب",
  "You need to sign in first to add items to your cart.": "يجب تسجيل الدخول أولا لإضافة عناصر إلى السلة.",
  "Order Cancelled": "تم إلغاء الطلب",
  "This order was cancelled by the vendor.": "تم إلغاء هذا الطلب من البائع.",
  Delivery: "توصيل",
  Pickup: "استلام",
  "On the Way": "في الطريق",
  "Order Delivered!": "تم تسليم الطلب!",
  "How was your experience?": "كيف كانت تجربتك؟",
  "Add Photo (optional)": "إضافة صورة (اختياري)",
  "JPG, PNG - Max 2MB": "JPG أو PNG - بحد أقصى 2MB",
  "Submit Review": "إرسال التقييم",
  Submitted: "تم الإرسال",
  "My Offers": "عروضي",
  "Add Offer": "إضافة عرض",
  "+ Add Offer": "+ إضافة عرض",
  "+ Add": "+ إضافة",
  "Edit Offer": "تعديل العرض",
  "New Offer": "عرض جديد",
  Title: "العنوان",
  Description: "الوصف",
  Photo: "الصورة",
  "Original Price": "السعر الأصلي",
  "Discount Price": "سعر الخصم",
  "Quantity Available": "الكمية المتاحة",
  "Expires In (hours)": "ينتهي خلال (ساعات)",
  "Expiration Date": "تاريخ الانتهاء",
  "Save Changes": "حفظ التغييرات",
  "Create Offer": "إنشاء عرض",
  "No offers yet. Create one to get started!": "لا توجد عروض بعد. أنشئ عرضا للبدء!",
  Stock: "المخزون",
  Expires: "ينتهي",
  "Recent Orders": "الطلبات الأخيرة",
  "Order ID": "رقم الطلب",
  Offer: "العرض",
  Amount: "المبلغ",
  "No orders yet": "لا توجد طلبات بعد",
  "Sales History": "سجل المبيعات",
  "Sale ID": "رقم البيع",
  Qty: "الكمية",
  Price: "السعر",
  Date: "التاريخ",
  "Order Status": "حالة الطلب",
  "Quantity Sold": "الكمية المباعة",
  "Total Price": "السعر الإجمالي",
  Phone: "الهاتف",
  "Delivery Type": "نوع التسليم",
  "Order Date": "تاريخ الطلب",
  "Sales Charts": "رسوم المبيعات",
  "Sustainability Impact": "أثر الاستدامة",
  "Show Less": "عرض أقل",
  "Top Selling Offers": "العروض الأكثر مبيعا",
  "Your best performing offers by units sold": "أفضل عروضك أداء حسب الوحدات المباعة",
  sold: "مباع",
  "Your Sustainability Impact": "أثرك في الاستدامة",
  "Your contribution to reducing food waste": "مساهمتك في تقليل هدر الطعام",
  "Meals Saved": "وجبات تم إنقاذها",
  "CO2 Prevented": "انبعاثات CO2 تم تجنبها",
  "CO₂ Prevented": "انبعاثات CO2 تم تجنبها",
  "Revenue Recovered": "إيرادات مستردة",
  "Welcome back,": "مرحبا بعودتك،",
  "Your Business": "عملك التجاري",
  "Manage your offers and orders": "أدر عروضك وطلباتك",
  Impact: "الأثر",
  orders: "طلبات",
  Expired: "منتهي",
  Disabled: "معطل",
  "Saving...": "جاري الحفظ...",
  "Taking longer than usual...": "يستغرق وقتا أطول من المعتاد...",
  "Platform deduction (12%):": "خصم المنصة (12%):",
  "Gross revenue was": "كان إجمالي الإيراد",
  "Please fill in title and description": "يرجى إدخال العنوان والوصف",
  "Please select a branch first": "يرجى اختيار فرع أولا",
  "Discount price must be less than original price": "يجب أن يكون سعر الخصم أقل من السعر الأصلي",
  "Offer updated!": "تم تحديث العرض!",
  "Offer created!": "تم إنشاء العرض!",
  "Offer deleted!": "تم حذف العرض!",
  "Failed to save offer": "فشل حفظ العرض",
  "Failed to delete offer": "فشل حذف العرض",
  "Failed to update branch": "فشل تحديث الفرع",
  "Failed to delete branch": "فشل حذف الفرع",
  "Failed to update status": "فشل تحديث الحالة",
  "Network error.": "خطأ في الشبكة.",
  "Network error": "خطأ في الشبكة",
  "Network error. Please try again.": "خطأ في الشبكة. يرجى المحاولة مرة أخرى.",
  "Pay": "ادفع",
  "Active Offers": "العروض النشطة",
  "Total Orders": "إجمالي الطلبات",
  "Units Sold": "الوحدات المباعة",
  "Net Revenue": "صافي الإيرادات",
  "Net Revenue by Month (EGP)": "صافي الإيرادات حسب الشهر (ج.م)",
  "Orders Overview": "نظرة عامة على الطلبات",
  Branches: "الفروع",
  Orders: "الطلبات",
  Notifications: "الإشعارات",
  "My Profile": "حسابي",
  "Go to profile": "اذهب إلى الحساب",
  "Vendor Account": "حساب بائع",
  "Add Branch": "إضافة فرع",
  "+ Add Branch": "+ إضافة فرع",
  "Edit Branch": "تعديل الفرع",
  "Delete Offer": "حذف العرض",
  "Delete Branch": "حذف الفرع",
  "Are you sure? This cannot be undone.": "هل أنت متأكد؟ لا يمكن التراجع عن هذا.",
};

const arAttributes = {
  "Search food, restaurants, or deals...": "ابحث عن طعام أو مطاعم أو عروض...",
  "Write your comment... (optional, max 500 chars)": "اكتب تعليقك... (اختياري، بحد أقصى 500 حرف)",
  "Search by name or email...": "ابحث بالاسم أو البريد الإلكتروني...",
  "Search by name or email…": "ابحث بالاسم أو البريد الإلكتروني...",
  "e.g., Fresh Pasta": "مثال: مكرونة طازجة",
  "e.g., 24": "مثال: 24",
  "Dismiss": "إغلاق",
  Edit: "تعديل",
  Delete: "حذف",
  "Go to profile": "اذهب إلى الحساب",
};

const originalTextNodes = new WeakMap();
const originalAttributes = new WeakMap();

const textNodes = (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
};

const normalize = (value) => value.replace(/\s+/g, " ").trim();
const stripIcons = (value) => normalize(value.replace(/^[^\p{L}\p{N}+]+/u, "").replace(/[^\p{L}\p{N})%]+$/u, ""));

const translateText = (value) => {
  const exact = arText[normalize(value)];
  if (exact) return value.replace(normalize(value), exact);

  const withoutIcon = stripIcons(value);
  const stripped = arText[withoutIcon];
  if (stripped) return value.replace(withoutIcon, stripped);

  const viewAll = normalize(value).match(/^View All \((\d+)\)$/i);
  if (viewAll) return `عرض الكل (${viewAll[1]})`;

  const countAvailable = normalize(value).match(/^(\d+) available$/i);
  if (countAvailable) return `${countAvailable[1]} متاح`;

  const countLeft = normalize(value).match(/^(\d+)\s+left$/i);
  if (countLeft) return `${countLeft[1]} متبقي`;

  const itemCount = normalize(value).match(/^(\d+) item\(s\)$/i);
  if (itemCount) return `${itemCount[1]} عنصر`;

  const welcomeBack = normalize(value).match(/^Welcome back,\s*(.+?)(\s*[^\w\s]*)?$/i);
  if (welcomeBack) return `مرحبا بعودتك، ${welcomeBack[1]}${welcomeBack[2] || ""}`;

  const orderCount = normalize(value).match(/^(\d+)\s+orders$/i);
  if (orderCount) return `${orderCount[1]} طلبات`;

  const stockExpires = normalize(value).match(/^Stock:\s*(.+?)\s*\|\s*Expires:\s*(.+)$/i);
  if (stockExpires) return `المخزون: ${stockExpires[1]} | ينتهي: ${stockExpires[2]}`;

  const egpAmount = normalize(value).match(/^EGP\s+(.+)$/i);
  if (egpAmount) return `${egpAmount[1]} ج.م`;

  const payEgp = normalize(value).match(/^Pay\s+EGP\s+(.+)$/i);
  if (payEgp) return `ادفع ${payEgp[1]} ج.م`;

  const offersTitle = normalize(value).match(/^(.+)\s+Offers$/i);
  if (offersTitle && arText[offersTitle[1]]) return `${arText[offersTitle[1]]} عروض`;

  const minutesRange = normalize(value).match(/^(\d+)-(\d+)\s+minutes$/i);
  if (minutesRange) return `${minutesRange[1]}-${minutesRange[2]} دقيقة`;

  const saleNumber = normalize(value).match(/^Sale\s+#(.+)$/i);
  if (saleNumber) return `بيع #${saleNumber[1]}`;

  const contactPhone = normalize(value).match(/^Contact:\s*(.+)$/i);
  if (contactPhone) return `التواصل: ${contactPhone[1]}`;

  if (/^CO.+Prevented$/i.test(normalize(value))) return "انبعاثات CO2 تم تجنبها";
  if (/^for a greener planet/i.test(normalize(value))) return "من أجل كوكب أكثر خضرة 🌱";

  const copyright = normalize(value).match(/^©\s*(\d{4})\s+ZeroWaste\.\s+All rights reserved\.$/i);
  if (copyright) return `© ${copyright[1]} ZeroWaste. جميع الحقوق محفوظة.`;

  const platformCut = normalize(value).match(/^Platform deduction \(12%\):\s*(.+?)\s+Gross revenue was\s+(.+)$/i);
  if (platformCut) return `خصم المنصة (12%): ${platformCut[1]} - كان إجمالي الإيراد ${platformCut[2]}`;

  return null;
};

function applyArabicTranslations(root) {
  textNodes(root).forEach((node) => {
    if (node.parentElement?.closest('[data-no-translate]')) return;
    const original = originalTextNodes.get(node) ?? node.nodeValue;
    const translated = translateText(original);
    if (!translated) return;
    if (!originalTextNodes.has(node)) originalTextNodes.set(node, original);
    if (node.nodeValue !== translated) node.nodeValue = translated;
  });

  root.querySelectorAll("[placeholder], [title], [aria-label]").forEach((element) => {
    if (element.closest('[data-no-translate]')) return;
    if (!originalAttributes.has(element)) originalAttributes.set(element, {});
    const originals = originalAttributes.get(element);
    ["placeholder", "title", "aria-label"].forEach((attr) => {
      if (!element.hasAttribute(attr)) return;
      const original = originals[attr] ?? element.getAttribute(attr);
      const translated = arAttributes[original];
      if (!translated) return;
      if (!originals[attr]) originals[attr] = original;
      if (translated && element.getAttribute(attr) !== translated) element.setAttribute(attr, translated);
    });
  });
}

function restoreOriginalText(root) {
  textNodes(root).forEach((node) => {
    const original = originalTextNodes.get(node);
    if (original && node.nodeValue !== original) node.nodeValue = original;
  });
  root.querySelectorAll("[placeholder], [title], [aria-label]").forEach((element) => {
    const originals = originalAttributes.get(element);
    if (!originals) return;
    Object.entries(originals).forEach(([attr, value]) => {
      if (element.getAttribute(attr) !== value) element.setAttribute(attr, value);
    });
  });
}

export default function RuntimeTranslator() {
  const { i18n } = useTranslation();

  useEffect(() => {
    let frameId = 0;
    const run = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        if (i18n.language?.startsWith("ar")) applyArabicTranslations(document.body);
        else restoreOriginalText(document.body);
      });
    };

    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    i18n.on("languageChanged", run);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      i18n.off("languageChanged", run);
    };
  }, [i18n]);

  return null;
}

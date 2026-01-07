import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User,
  Search,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import PageHeader from "@/components/PageHeader";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";

const blogPosts = [
  {
    id: 1,
    title: "מדריך למתחילים: כל מה שצריך לדעת על נומרולוגיה",
    excerpt: "נומרולוגיה היא מדע עתיק שמאמין שלמספרים יש משמעות רוחנית ומיסטית. גלה כיצד המספרים בחייך יכולים לחשוף תובנות על האישיות והייעוד שלך.",
    content: `
      נומרולוגיה היא מדע עתיק שמקורו במסורות שונות ברחבי העולם. בניגוד למה שחושבים רבים, נומרולוגיה אינה חיזוי עתידות, אלא כלי להבנה עמוקה יותר של האישיות והפוטנציאל האישי.

      **היסודות:**
      - כל אות ומספר נושאים תדירות אנרגטית ייחודית
      - חישובים מבוססים על שם ותאריך לידה
      - מספרי המפתח: חיים, גורל, נשמה ואישיות

      **מספר החיים:**
      זהו המספר החשוב ביותר בנומרולוגיה. הוא מחושב מתאריך הלידה ומייצג את המסלול והאתגרים המרכזיים בחיים.

      **איך להשתמש בנומרולוגיה:**
      1. הבן את המספרים שלך
      2. זהה דפוסים בחייך
      3. השתמש בתובנות לצמיחה אישית
      4. התאם החלטות למספרים המזליים שלך

      נומרולוגיה יכולה לעזור בקבלת החלטות, הבנת יחסים, ובחירת מקצוע מתאים.
    `,
    author: 'ד"ר רחל כהן',
    date: new Date(2024, 0, 15),
    readTime: "7 דקות קריאה",
    category: "נומרולוגיה",
    image: "/blog/numerology-guide.jpg",
    tags: ["נומרולוגיה", "מתחילים", "מדריך"],
    trending: true
  },
  {
    id: 2,
    title: "המזלות ב-2024: מה מחכה לך השנה?",
    excerpt: "סקירה אסטרולוגית מקיפה של 2024 עם תחזיות למזלות השונים. גלה מה הכוכבים מתכננים עבורך.",
    content: `
      2024 היא שנה מיוחדת מבחינה אסטרולוגית עם מעברים פלנטריים משמעותיים. הנה מה שצפוי לכל מזל:

      **מזל טלה (21.3-19.4):**
      שנת צמיחה אישית והזדמנויות חדשות. יופיטר בשביעי מביא מזל ביחסים.

      **מזל שור (20.4-20.5):**
      שנת יציבות כלכלית. התמקד בבניית בסיס איתן לעתיד.

      **מזל תאומים (21.5-20.6):**
      שנת תקשורת ולמידה. הזדמנויות לנסיעות והרחבת אופקים.

      **אירועי המפתח ב-2024:**
      - ליקוי שמש באפריל - זמן לתחילות חדשות
      - צדק במזל תאומים - הרחבת ידע ותקשורת
      - שבתאי בדגים - השלמת מחזורים רוחניים

      השתמש בתחזיות אלו כהכוונה, לא כגזירת גורל. האסטרולוגיה מספקת תובנות, אבל אתה מחליט את גורלך.
    `,
    author: "איתן לוי",
    date: new Date(2024, 0, 3),
    readTime: "10 דקות קריאה",
    category: "אסטרולוגיה",
    image: "/blog/astrology-2024.jpg",
    tags: ["אסטרולוגיה", "תחזית", "2024"],
    trending: true
  },
  {
    id: 3,
    title: "5 סימנים בכף היד שמעידים על הצלחה כלכלית",
    excerpt: "קריאת כף יד עשויה לחשוף אינדיקציות על פוטנציאל כלכלי. גלה מה הקווים בידיך אומרים על עתידך הכלכלי.",
    content: `
      קריאת כף יד (כירומנטיה) היא אומנות עתיקה של פרשנות קווים, צורות וסימנים בכף היד.

      **5 הסימנים המבטיחים:**

      1. **משולש הכסף**
      קווים שיוצרים משולש בין קו החיים, הראש והגורל מעידים על יכולת לצבור עושר.

      2. **קו השמש ברור**
      קו מוגדר היטב המוביל להר השמש (מתחת לאצבע הקמיצה) - סימן להצלחה ופרסום.

      3. **הרי יופיטר מפותחים**
      בליטה בולטת בבסיס האצבע המורה - שאפתנות ויכולת מנהיגות.

      4. **קווים אנכיים רבים**
      קווים מעלה-מטה על הר יופיטר - הזדמנויות רבות להצלחה.

      5. **כוכב על הר יופיטר**
      סימן נדיר של מזל מיוחד והצלחה יוצאת דופן.

      זכור: הכף משקפת פוטנציאל, לא גזירת גורל. השקעה ועבודה קשה הם המפתחות האמיתיים להצלחה.
    `,
    author: "מיכל רוזן",
    date: new Date(2023, 11, 20),
    readTime: "6 דקות קריאה",
    category: "קריאת כף יד",
    image: "/blog/palmistry-wealth.jpg",
    tags: ["כף יד", "הצלחה", "כלכלה"]
  },
  {
    id: 4,
    title: "הקשר בין גרפולוגיה לאישיות: מה הכתב שלך אומר עליך",
    excerpt: "גרפולוגיה מנתחת את אישיותך דרך כתב היד. גלה מה הכתיבה שלך חושפת על המוח והרגשות שלך.",
    content: `
      גרפולוגיה היא מדע הניתוח האישיות דרך כתב יד. מחקרים מראים קשר בין דפוסי כתיבה לתכונות אישיות.

      **מה ניתן ללמוד מכתב יד:**

      **גודל אותיות:**
      - גדול = אקסטרוברט, בטוח בעצמו
      - קטן = אינטרוברט, ממוקד בפרטים
      - בינוני = מאוזן ומתאים

      **שיפוע הכתב:**
      - ימינה = רגשי, פתוח לאחרים
      - שמאלה = שמרן, מוסתר
      - זקוף = הגיוני, שולט ברגשות

      **לחץ הכתיבה:**
      - חזק = אסרטיבי, נחוש
      - חלש = רגיש, גמיש
      - משתנה = מצב רוח משתנה

      **רווחים:**
      - רווחים גדולים = צורך במרחב אישי
      - רווחים קטנים = חברתי מאוד
      - לא עקבי = ספונטני

      **שימושים:**
      גרפולוגיה משמשת בגיוס עובדים, ייעוץ זוגי, וטיפול פסיכולוגי. זהו כלי עוצמתי להבנה עצמית.
    `,
    author: "פרופ' דוד שלום",
    date: new Date(2023, 11, 10),
    readTime: "8 דקות קריאה",
    category: "גרפולוגיה",
    image: "/blog/graphology-personality.jpg",
    tags: ["גרפולוגיה", "אישיות", "כתב יד"]
  }
];

const categories = [
  { name: "הכל", count: blogPosts.length },
  { name: "נומרולוגיה", count: blogPosts.filter(p => p.category === "נומרולוגיה").length },
  { name: "אסטרולוגיה", count: blogPosts.filter(p => p.category === "אסטרולוגיה").length },
  { name: "קריאת כף יד", count: blogPosts.filter(p => p.category === "קריאת כף יד").length },
  { name: "גרפולוגיה", count: blogPosts.filter(p => p.category === "גרפולוגיה").length }
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "הכל" || post.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => setSelectedPost(null)}
            variant="outline"
            className="border-purple-500 text-purple-300 mb-8"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור לבלוג
          </Button>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30">
              <CardContent className="p-8 md:p-12">
                <Badge className="bg-purple-600 text-white mb-4">
                  {selectedPost.category}
                </Badge>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {selectedPost.title}
                </h1>

                <div className="flex flex-wrap gap-4 text-purple-300 mb-8">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {selectedPost.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(selectedPost.date, 'dd MMMM yyyy', { locale: he })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedPost.readTime}
                  </div>
                </div>

                <div className="prose prose-invert prose-purple max-w-none">
                  {selectedPost.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-purple-100 leading-relaxed mb-4 text-lg">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-purple-900/30">
                  {selectedPost.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="border-purple-600/50 text-purple-300">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="בלוג ומאמרים"
          description="תובנות, מדריכים וחדשות מעולם המיסטיקה"
          icon={BookOpen}
          iconGradient="from-blue-600 to-purple-600"
        />

        {/* Search and filters */}
        <FadeIn>
          <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="חפש מאמרים..."
                    className="bg-gray-800 border-purple-600/50 text-white pr-10"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedCategory === cat.name
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Blog posts */}
        {filteredPosts.length === 0 ? (
          <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">לא נמצאו מאמרים</h3>
              <p className="text-gray-400">נסה לשנות את הסינון או החיפוש</p>
            </CardContent>
          </Card>
        ) : (
          <StaggerContainer staggerDelay={0.1}>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <StaggerItem key={post.id}>
                  <motion.div whileHover={{ y: -5 }}>
                    <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30 hover:border-purple-600/50 transition-all h-full cursor-pointer group"
                          onClick={() => setSelectedPost(post)}>
                      <CardHeader>
                        <div className="flex items-start justify-between mb-4">
                          <Badge className="bg-purple-600 text-white">
                            {post.category}
                          </Badge>
                          {post.trending && (
                            <Badge className="bg-orange-600 text-white">
                              <TrendingUp className="w-3 h-3 ml-1" />
                              טרנדי
                            </Badge>
                          )}
                        </div>

                        <CardTitle className="text-white text-xl mb-3 group-hover:text-purple-300 transition-colors">
                          {post.title}
                        </CardTitle>

                        <p className="text-purple-300 leading-relaxed mb-4">
                          {post.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-3 text-sm text-purple-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(post.date, 'dd MMM', { locale: he })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {post.tags.slice(0, 2).map((tag, i) => (
                              <Badge key={i} variant="outline" className="border-purple-600/50 text-purple-300 text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="ghost" className="text-purple-400 group-hover:text-purple-300">
                            קרא עוד
                            <ArrowRight className="w-4 h-4 mr-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
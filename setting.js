// Function to calculate the number of days since a given date in Vietnam time (GMT+7)
function calculateDaysSince(dateString) {
    // Parse the start date as UTC
    const startDate = new Date(Date.UTC(new Date(dateString).getFullYear(), new Date(dateString).getMonth(), new Date(dateString).getDate()));

    // Get the current date as UTC
    const currentDate = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));

    // Calculate the difference in time
    const diffTime = currentDate - startDate;

    // Calculate the difference in days
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}
// User Information
export const userInfo = [
    {
        background: "https://images.unsplash.com/photo-1712397943847-e104395a1a8b?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        avatar: 'https://i.ibb.co/QnnHWWW/IMG-8490.jpg',
        name: 'Lê Vĩnh Khang (Aedotris)',
        info: `Celebrating ${calculateDaysSince("2024-03-06")} days of love, laughter, and adventures with my amazing partner.`,
    }
];

// Social Media Links
export const secctionCopy = [
    {
        image: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
        title: 'Instagram',
        name: 'williamcachamwri',
        link: 'https://instagram.com/williamcachamwri',
    },
    {
        image: "https://levinhkhang.org/_next/static/img/GITHUB.webp",
        title: 'Github',
        name: 'levinhkhangzz',
        link: 'https://github.com/levinhkhangzz',
    },
    {
        image: "https://th.bing.com/th/id/OIP.Fmbl3XZiHagmGL9tKx0kUAHaHa?rs=1&pid=ImgDetMain",
        title: 'Telegram',
        name: 'NotYourParentsX',
        link: 'https://t.me/NotYourParentsX',
    },
    {
        image: "https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/ad/dd/75/addd7565-7b92-14cf-3911-3cd328e13c78/AppIcon-0-0-1x_U007emarketing-0-10-0-0-85-220.png/512x512bb.jpg",
        title: 'Gemini Pro Chat',
        name: 'Chat',
        link: 'https://chat.levinhkhang.org/',
    },
    {
        image: "https://th.bing.com/th/id/OIP.Xo_FCK4zl3xBtFXByduYzQHaHa?rs=1&pid=ImgDetMain",
        title: 'Facebook',
        name: 'Lê Vĩnh Khang',
        link: 'https://www.facebook.com/profile.php?id=199717642',
    },
    {
        image: "https://i.pinimg.com/736x/1d/07/c2/1d07c2bacaefc123ddc782e6288ddc41.jpg",
        title: 'Zalo',
        name: 'Lê Vĩnh Khang',
        link: 'https://zalo.me/levinhkhangdeptrai',
    },
];

// Modal Information
export const modalssss = [
    {
        image: "https://th.bing.com/th/id/R.a60b690a4f78161e558c959e157d7b0d?rik=0cISg63VqH72cg&pid=ImgRaw&r=0",
        title: 'MB Bank',
        name: 'Get QR Code',
        modal: 'https://img.vietqr.io/image/MB-0905243477-print.png',
    },
    {
        image: "https://laserbinhthuan.com/wp-content/uploads/2021/10/meta-logo-facebook.jpg",
        title: 'Certificate',
        name: 'Meta',
        modal: 'https://raw.githubusercontent.com/levinhkhangzz/assets/main/z5164475138499_f66102b26d26a8b2e05af624fffab1e0.jpg',
    },
    {
        image: "https://th.bing.com/th/id/OIP.kY7h_2SMSJv6fdNrPrAROQAAAA?w=400&h=400&rs=1&pid=ImgDetMain",
        title: 'Certificate',
        name: 'Google Cloud',
        modal: 'https://raw.githubusercontent.com/levinhkhangzz/assets/main/z5164475157110_f11989f1964f1fb581f7d2efd0bb5788.jpg',
    },
    {
        image: "https://th.bing.com/th/id/OIP.ysdCJiI4OEy9VF-5ituvWwAAAA?w=300&h=300&rs=1&pid=ImgDetMain",
        title: 'Certificate',
        name: 'Amazon Web Service',
        modal: 'https://raw.githubusercontent.com/levinhkhangzz/assets/main/z5164475154720_a0157710d39eed70389cf7b43ff6793a.jpg',
    },
];

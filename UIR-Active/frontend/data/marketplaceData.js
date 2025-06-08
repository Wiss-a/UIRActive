// Sample data for sport categories
export const categories = [
    { id: '1', title: 'Basketball', icon: 'basketball-outline' },
    { id: '2', title: 'Football', icon: 'football-outline' },
    { id: '3', title: 'Tennis', icon: 'tennisball-outline' },
    { id: '4', title: 'Running', icon: 'walk-outline' },
    { id: '5', title: 'Gym Gear', icon: 'barbell-outline' },
    { id: '6', title: 'Team Wear', icon: 'shirt-outline' },
    { id: '7', title: 'Accessories', icon: 'watch-outline' },
];

// Updated trendingItems with Moroccan sellers
export const trendingItems = [
    { 
        id: '1', 
        title: 'Nike Basketball Shoes', 
        price: '850 DH', 
        image: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'], 
        distance: 'North Campus', 
        seller: 'Youssef El Amrani',
        description: 'Excellent condition, worn only 3 times. Size 10. No scuffs or damage.',
        quantity: 1,
        size: '10',
        condition: 'Excellent condition',
        contactInfo:'0642072155'
    },
    { 
        id: '2', 
        title: 'Wilson Tennis Racket', 
        price: '450 DH', 
        image: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqpHt4BRNmq7d59IjdEP_c164v7QdqBGkKD69weQl4GneDyEP1ath-pU17JPuYqIcwXrY&usqp=CAU'], 
        distance: 'East Dorms', 
        seller: 'Amina Tlemcani',
        description: 'Good condition, some grip wear but strings are new and tight. Includes cover.',
        quantity: 1,
        size: null,
        condition: 'Good condition'
    },
    { 
        id: '3', 
        title: 'Adidas Soccer Cleats', 
        price: '900 DH', 
        image: ['https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/de95f23dc9fb437f9e0c550e8072adb9_9366/f50-elite-laceless-firm-ground-cleats.jpg'], 
        distance: 'Athletics Building', 
        seller: 'Reda Chafik',
        description: 'Used for one season, still in great shape. Minor grass stains. Size 9.5.',
        quantity: 1,
        size: '9.5',
        condition: 'Used - Excellent'
    },
    { 
        id: '4', 
        title: 'Yoga Mat (barely used)', 
        price: '150 DH', 
        image: ['https://images.unsplash.com/photo-1592432678016-e910b452f9a2'], 
        distance: 'South Campus', 
        seller: 'Soukaina El Khalfi',
        description: 'Like new! Used only twice, sanitized and clean. Standard thickness, no tears.',
        quantity: 1,
        size: null,
        condition: 'Like new'
    },
];

// Updated featuredSections with Moroccan sellers
export const featuredSections = [
    { 
        id: '1', 
        title: 'Team Sports Equipment', 
        items: [
            { 
                id: '1', 
                title: 'Basketball (Official Size)', 
                price: '200 DH', 
                image: ['https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'], 
                distance: 'Gym', 
                seller: 'Imane Rami',
                description: 'Near new condition, good grip and bounce. Regulation size and weight. Used indoors only.',
                quantity: 1,
                size: null,
                condition: 'Near new condition'
            },
            { 
                id: '2', 
                title: 'Soccer Ball - Nike', 
                price: '250 DH', 
                image: ['https://images.unsplash.com/photo-1614632537190-23e4146777db', 'https://images.unsplash.com/photo-1614632537190-23e4146777db'], 
                distance: 'West Campus', 
                seller: 'Karim Bouazza',
                description: 'Brand new, never used in a game. FIFA quality, perfect air retention.',
                quantity: 2,
                size: null,
                condition: 'Brand new'
            },
            { 
                id: '3', 
                title: 'Volleyball Set w/ Net', 
                price: '550 DH', 
                image: ['https://images.unsplash.com/photo-1592656094267-764a45160876', 'https://images.unsplash.com/photo-1592656094267-764a45160876'], 
                distance: 'Recreation Center', 
                seller: 'Fatima Zahra El Fassi',
                description: 'Used for one summer. Net in perfect condition, volleyball shows minor wear. Includes pump and stakes.',
                quantity: 1,
                size: null,
                condition: 'Used - Good condition'
            },
        ]
    },
    { 
        id: '2', 
        title: 'Fitness Deals', 
        items: [
            { 
                id: '1', 
                title: 'Resistance Bands Set', 
                price: '180 DH', 
                image: ['https://images.unsplash.com/photo-1598971639058-fab3c3109a00', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00'], 
                distance: 'South Dorms', 
                seller: 'Nour Ait Benhammou',
                description: 'Complete set of 5 bands, light to heavy resistance. Almost new, includes door anchor and handles.',
                quantity: 1,
                size: null,
                condition: 'Almost new'
            },
            { 
                id: '2', 
                title: '15lb Dumbbells (pair)', 
                price: '350 DH', 
                image: ['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61'], 
                distance: 'Graduate Housing', 
                seller: 'Salma Bouziane',
                description: 'Cast iron dumbbells with rubber coating. Minor cosmetic wear but functionally perfect. Selling because I upgraded.',
                quantity: 1,
                size: null,
                condition: 'Used - Good condition'
            },
            { 
                id: '3', 
                title: 'Nike Running Shoes W8', 
                price: '500 DH', 
                image: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5'], 
                distance: 'East Campus', 
                seller: 'Mehdi Bensaid',
                description: 'Women\'s size 8. Used for one semester, good condition with some minor sole wear. Very comfortable for long runs.',
                quantity: 1,
                size: '8',
                condition: 'Good condition'
            },
        ]
    },
    { 
        id: '3', 
        title: 'Intramural Team Gear', 
        items: [
            { 
                id: '1', 
                title: 'Team Jerseys (set of 6)', 
                price: '750 DH', 
                image: ['https://images.unsplash.com/photo-1517466787929-bc90951d0974'], 
                distance: 'Student Union', 
                seller: 'Said Ait Ouali',
                description: 'Reversible blue/white jerseys, lightly used for one season. All size L/XL. Machine washable, no rips or stains.',
                quantity: 6,
                size: 'L/XL',
                condition: 'Lightly used'
            },
            { 
                id: '2', 
                title: 'Sports First Aid Kit', 
                price: '150 DH', 
                image: ['https://images.unsplash.com/photo-1603398938378-e54eab446dde'], 
                distance: 'Health Center', 
                seller: 'Lina Berrada',
                description: 'Unopened and complete kit with athletic tape, bandages, cold packs, and basic injury supplies. Perfect for team sidelines.',
                quantity: 3,
                size: null,
                condition: 'Unopened'
            },
            { 
                id: '3', 
                title: 'Team Gym Bag', 
                price: '300 DH', 
                image: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62'], 
                distance: 'Athletics Dept', 
                seller: 'Hicham Tazi',
                description: 'University branded gym bag, gently used. Large capacity with shoe compartment and water bottle holder. Minor wear on straps.',
                quantity: 2,
                size: null,
                condition: 'Gently used'
            },
        ]
    },
];

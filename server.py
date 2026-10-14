#!/usr/bin/env python3
"""
FORMÉLI & CO. — REYKJAVÍK, ICELAND
Content Management System (CMS) & E-Commerce REST API Server
Built with Python Standard Library (Zero External Dependencies)
"""

import os
import sys
import json
import sqlite3
import mimetypes
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from datetime import datetime

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, 'formeli.db')

# ==============================================================================
# Database Initialization & Seeding
# ==============================================================================
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 1. Products Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        category_key TEXT NOT NULL,
        price_eur REAL NOT NULL,
        price_isk REAL NOT NULL,
        price_usd REAL NOT NULL,
        rating REAL DEFAULT 5.0,
        reviews_count INTEGER DEFAULT 0,
        is_new INTEGER DEFAULT 0,
        is_signature INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        tagline TEXT,
        composition TEXT,
        care TEXT,
        sizes_json TEXT,
        colors_json TEXT,
        created_at TEXT
    )''')

    # 2. Content Blocks Table (Hero, Categories, Philosophy, Materials, Settings)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS content_blocks (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT
    )''')

    # 3. Journal Articles Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS journal_articles (
        id TEXT PRIMARY KEY,
        tag TEXT,
        title TEXT NOT NULL,
        summary TEXT,
        date_str TEXT,
        read_time TEXT,
        image TEXT,
        content TEXT,
        created_at TEXT
    )''')

    # 4. Orders Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT,
        customer_email TEXT,
        total_amount REAL,
        currency TEXT,
        items_json TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TEXT
    )''')

    # 5. Subscribers Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at TEXT
    )''')

    # 6. Promo Codes Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS promo_codes (
        code TEXT PRIMARY KEY,
        discount_percent REAL NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT
    )''')

    conn.commit()

    # Seed initial data if products table is empty
    cursor.execute('SELECT COUNT(*) FROM products')
    count = cursor.fetchone()[0]
    if count == 0:
        seed_initial_data(conn)
    conn.close()

def seed_initial_data(conn):
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    # Seed default products
    initial_products = [
        {
            "id": "coat-01",
            "name": "Double-Breasted Cashmere Coat",
            "category": "Coats",
            "category_key": "coats",
            "price_eur": 480,
            "price_isk": 72000,
            "price_usd": 520,
            "rating": 4.9,
            "reviews_count": 38,
            "is_new": 1,
            "is_signature": 1,
            "is_active": 1,
            "tagline": "Tailored in Reykjavik from 10% Icelandic wool & 90% Grade-A cashmere.",
            "composition": "90% Mongolian Cashmere, 10% Icelandic Virgin Wool. Cupro lining.",
            "care": "Specialist dry clean only. Store on shaped wooden hanger.",
            "sizes": ["XS", "S", "M", "L", "XL"],
            "colors": [
                {
                    "name": "Dark Chocolate",
                    "hex": "#3E2B23",
                    "image": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Warm Oat",
                    "hex": "#CBB89E",
                    "image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Camel",
                    "hex": "#AB664F",
                    "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Espresso",
                    "hex": "#241B17",
                    "image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=85"
                }
            ]
        },
        {
            "id": "knit-01",
            "name": "Chunky Fisherman Turtleneck",
            "category": "Knitwear",
            "category_key": "knitwear",
            "price_eur": 260,
            "price_isk": 39000,
            "price_usd": 285,
            "rating": 5.0,
            "reviews_count": 52,
            "is_new": 0,
            "is_signature": 1,
            "is_active": 1,
            "tagline": "Sub-arctic warmth with zero bulk. Hand-linked ribbed cuffs and mock neckline.",
            "composition": "100% Certified Organic Cashmere (2-ply yarn).",
            "care": "Hand wash cold with wool detergent or gentle dry clean. Dry flat.",
            "sizes": ["XS", "S", "M", "L"],
            "colors": [
                {
                    "name": "Cream",
                    "hex": "#EDE1D4",
                    "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Oat",
                    "hex": "#CBB89E",
                    "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Mocha",
                    "hex": "#7B5A45",
                    "image": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=85"
                }
            ]
        },
        {
            "id": "blazer-01",
            "name": "Tailored Icelandic Wool Blazer",
            "category": "Essentials",
            "category_key": "essentials",
            "price_eur": 320,
            "price_isk": 48000,
            "price_usd": 350,
            "rating": 4.8,
            "reviews_count": 24,
            "is_new": 1,
            "is_signature": 0,
            "is_active": 1,
            "tagline": "Structured shoulders with a relaxed drape. Made from un-dyed natural wool.",
            "composition": "100% Icelandic Natural Sheep's Wool. Horn buttons.",
            "care": "Dry clean only. Brush with soft bristle brush between wears.",
            "sizes": ["S", "M", "L", "XL"],
            "colors": [
                {
                    "name": "Chocolate",
                    "hex": "#6A4735",
                    "image": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Taupe",
                    "hex": "#A8927B",
                    "image": "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Espresso",
                    "hex": "#241B17",
                    "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=1000&q=85"
                }
            ]
        },
        {
            "id": "trouser-01",
            "name": "Pleated Wide-Leg Wool Trousers",
            "category": "Essentials",
            "category_key": "essentials",
            "price_eur": 280,
            "price_isk": 42000,
            "price_usd": 305,
            "rating": 4.9,
            "reviews_count": 31,
            "is_new": 0,
            "is_signature": 1,
            "is_active": 1,
            "tagline": "High-waisted, architectural double pleats crafted for effortless fluid movement.",
            "composition": "98% Virgin Wool, 2% Elastane for subtle comfort stretch.",
            "care": "Dry clean only. Cool iron on reverse side.",
            "sizes": ["XS", "S", "M", "L"],
            "colors": [
                {
                    "name": "Taupe",
                    "hex": "#A8927B",
                    "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Chocolate",
                    "hex": "#6A4735",
                    "image": "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Dark Chocolate",
                    "hex": "#3E2B23",
                    "image": "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85"
                }
            ]
        },
        {
            "id": "cardigan-01",
            "name": "Fine Merino Ribbed Cardigan",
            "category": "Knitwear",
            "category_key": "knitwear",
            "price_eur": 240,
            "price_isk": 36000,
            "price_usd": 260,
            "rating": 4.7,
            "reviews_count": 19,
            "is_new": 1,
            "is_signature": 0,
            "is_active": 1,
            "tagline": "Ultra-fine 17.5 micron merino wool with natural mother-of-pearl buttons.",
            "composition": "100% Extra-fine Australian Merino Wool (non-mulesed).",
            "care": "Gentle wool wash 30°C. Reshape while wet.",
            "sizes": ["XS", "S", "M", "L"],
            "colors": [
                {
                    "name": "Oat",
                    "hex": "#CBB89E",
                    "image": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Cream",
                    "hex": "#EDE1D4",
                    "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Mocha",
                    "hex": "#7B5A45",
                    "image": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Black",
                    "hex": "#1E1A16",
                    "image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85"
                }
            ]
        },
        {
            "id": "scarf-01",
            "name": "Brushed Cashmere Cocoon Scarf",
            "category": "Accessories",
            "category_key": "accessories",
            "price_eur": 150,
            "price_isk": 22500,
            "price_usd": 165,
            "rating": 5.0,
            "reviews_count": 67,
            "is_new": 0,
            "is_signature": 1,
            "is_active": 1,
            "tagline": "Oversized silhouette (210cm x 70cm) with delicate hand-twisted fringe.",
            "composition": "100% Cashmere with signature water-ripple finishing.",
            "care": "Dry clean or gentle hand wash in lukewarm water.",
            "sizes": ["One Size"],
            "colors": [
                {
                    "name": "Camel",
                    "hex": "#AB664F",
                    "image": "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Oat",
                    "hex": "#CBB89E",
                    "image": "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Espresso",
                    "hex": "#241B17",
                    "image": "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Taupe",
                    "hex": "#A8927B",
                    "image": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=1000&q=85"
                }
            ]
        },
        {
            "id": "bag-01",
            "name": "Reykjavík Minimalist Leather Tote",
            "category": "Accessories",
            "category_key": "accessories",
            "price_eur": 390,
            "price_isk": 58500,
            "price_usd": 425,
            "rating": 4.9,
            "reviews_count": 15,
            "is_new": 1,
            "is_signature": 1,
            "is_active": 1,
            "tagline": "Sculptural lines, plant-tanned calfskin, lined in unbleached organic linen.",
            "composition": "100% Vegetable-tanned Italian Calf Leather. Palladium hardware.",
            "care": "Condition with beeswax leather balm twice yearly. Keep away from direct water.",
            "sizes": ["Medium", "Large"],
            "colors": [
                {
                    "name": "Espresso",
                    "hex": "#241B17",
                    "image": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Chocolate",
                    "hex": "#6A4735",
                    "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85"
                }
            ]
        },
        {
            "id": "coat-02",
            "name": "Cocoon Belted Wrap Coat",
            "category": "Coats",
            "category_key": "coats",
            "price_eur": 520,
            "price_isk": 78000,
            "price_usd": 565,
            "rating": 4.9,
            "reviews_count": 42,
            "is_new": 0,
            "is_signature": 1,
            "is_active": 1,
            "tagline": "Unstructured elegance with sweeping storm lapels and self-tie sash belt.",
            "composition": "100% Double-faced Virgin Wool.",
            "care": "Dry clean only. Steam gently to refresh fibers.",
            "sizes": ["XS", "S", "M", "L"],
            "colors": [
                {
                    "name": "Camel",
                    "hex": "#AB664F",
                    "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Oat",
                    "hex": "#CBB89E",
                    "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=85"
                },
                {
                    "name": "Dark Chocolate",
                    "hex": "#3E2B23",
                    "image": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85",
                    "hoverImage": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85"
                }
            ]
        }
    ]

    for p in initial_products:
        cursor.execute('''
        INSERT OR REPLACE INTO products (
            id, name, category, category_key, price_eur, price_isk, price_usd,
            rating, reviews_count, is_new, is_signature, is_active,
            tagline, composition, care, sizes_json, colors_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            p["id"], p["name"], p["category"], p["category_key"],
            p["price_eur"], p["price_isk"], p["price_usd"],
            p["rating"], p["reviews_count"], p["is_new"], p["is_signature"], p["is_active"],
            p["tagline"], p["composition"], p["care"],
            json.dumps(p["sizes"]), json.dumps(p["colors"]), now
        ))

    # Seed Content Blocks
    default_content = {
        "hero_slides": [
            {
                "id": "slide-1",
                "tag": "A Season of Quiet Luxury",
                "title": "Modern Elegance in Rich Chocolate",
                "subtitle": "Timeless silhouettes tailored from Icelandic virgin wool and certified Mongolian cashmere. Designed for sub-arctic winds and eternal moments.",
                "image": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1920&q=85",
                "cta_primary_text": "Discover The Collection",
                "cta_primary_link": "#signature-edit-section",
                "cta_secondary_text": "Our Materials",
                "cta_secondary_link": "#materials-section"
            },
            {
                "id": "slide-2",
                "tag": "Nordic Luxury For Everyday Life",
                "title": "Timeless in Every Season",
                "subtitle": "Modern silhouettes. Natural materials. Thoughtfully designed for a more considered way of living.",
                "image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1920&q=85",
                "cta_primary_text": "Shop The Collection",
                "cta_primary_link": "#signature-edit-section",
                "cta_secondary_text": "Our Story",
                "cta_secondary_link": "#philosophy-section"
            },
            {
                "id": "slide-3",
                "tag": "Artisan Craftsmanship",
                "title": "Timeless Pieces for a Fuller You",
                "subtitle": "Crafted in collaboration with heritage family mills. Uncompromising texture, natural warmth, and quiet confidence.",
                "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85",
                "cta_primary_text": "Explore Outerwear",
                "cta_primary_link": "#signature-edit-section",
                "cta_secondary_text": "Our Materials",
                "cta_secondary_link": "#materials-section"
            }
        ],
        "site_settings": {
            "announcement_shipping": "Complimentary Express Shipping on Orders Over 45.000 ISK kr · Worldwide Duties Included",
            "free_shipping_threshold_isk": 45000,
            "free_shipping_threshold_eur": 300,
            "free_shipping_threshold_usd": 350,
            "default_currency": "ISK",
            "flagship_address": "Laugavegur 42, 101 Reykjavík, Iceland",
            "flagship_hours": "Mon – Sat: 11:00 – 18:00",
            "flagship_phone": "+354 555 4200",
            "flagship_email": "concierge@formeli.is"
        },
        "philosophy": {
            "origins_tag": "Our Origins",
            "origins_title": "Designed for Real Life",
            "origins_text": "Elevated essentials for modern days — navigating Reykjavik's brisk harborside winds, relaxing at home, and everywhere in between. Every coat is cut with generous room for layered knitwear without compromising an effortless, tailored silhouette.",
            "origins_image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
            "nordic_tag": "Nordic Philosophy",
            "nordic_title": "Less, but Better.",
            "nordic_text": "Better materials. More intention. A longer life. We partner exclusively with certified heritage spinning mills that honor sustainable farming and the natural lifecycle of animal fibers. By choosing rare Grade-A cashmere and virgin wool, our pieces develop character with every winter.",
            "nordic_image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
        },
        "materials": {
            "tag": "Provenance & Textiles",
            "title": "The Beauty in Natural Materials",
            "subtitle": "From the cloud-like softness of inner Mongolian cashmere to the elemental resilience of Icelandic sheep's wool, every fiber is selected for longevity, warmth, and enduring natural elegance.",
            "stat1_value": "14.5 µm",
            "stat1_label": "Grade-A Mongolian Cashmere Combing",
            "stat2_value": "100% Traceable",
            "stat2_label": "Ethical Nomadic Herding Partnerships",
            "stat3_value": "Sub-Arctic Proof",
            "stat3_label": "Naturally Water-Repellent Lopi Wool",
            "bg_image": "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=2000&q=85"
        }
    }

    for key, val in default_content.items():
        cursor.execute('INSERT OR REPLACE INTO content_blocks (key, value_json, updated_at) VALUES (?, ?, ?)',
                       (key, json.dumps(val), now))

    # Seed Journal Articles
    initial_articles = [
        {
            "id": "journal-01",
            "tag": "Transitional Dressing",
            "title": "Style into the New Season: A Reykjavík Guide",
            "summary": "Mastering the art of layering delicate knitwear with architectural overcoats against changing sub-arctic weather.",
            "date_str": "Autumn / Winter 2026",
            "read_time": "4 min read",
            "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
            "content": "In sub-arctic maritime climates, the secret to staying warm lies in micro-layering pure 2-ply cashmere beneath structured double-faced wool..."
        },
        {
            "id": "journal-02",
            "tag": "Wardrobe Theory",
            "title": "The Art of a Considered Wardrobe",
            "summary": "Why curating seven foundational pieces in rich chocolate and warm oat creates effortless daily versatility.",
            "date_str": "Editorial No. 14",
            "read_time": "6 min read",
            "image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
            "content": "Fast fashion promotes artificial urgency. A considered wardrobe instead focuses on lifetime silhouettes tailored in natural un-dyed fibers..."
        },
        {
            "id": "journal-03",
            "tag": "Destination & Life",
            "title": "From City to Coast: The Nordic Path",
            "summary": "How our tailored garments transition effortlessly from meetings in Reykjavík to coastal weekend retreats.",
            "date_str": "Craftsmanship Series",
            "read_time": "5 min read",
            "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
            "content": "From the modern glass facades of Harpa Concert Hall to the volcanic black sands of Vík, Forméli garments are built to endure and elevate..."
        }
    ]

    for a in initial_articles:
        cursor.execute('''
        INSERT OR REPLACE INTO journal_articles (
            id, tag, title, summary, date_str, read_time, image, content, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            a["id"], a["tag"], a["title"], a["summary"], a["date_str"], a["read_time"], a["image"], a["content"], now
        ))

    # Seed Default Promo Code
    cursor.execute('INSERT OR REPLACE INTO promo_codes (code, discount_percent, is_active, created_at) VALUES (?, ?, ?, ?)',
                   ('WELCOME10', 10.0, 1, now))

    # Seed a demo order for preview in CMS
    demo_order_items = [
        {
            "name": "Double-Breasted Cashmere Coat",
            "colorName": "Dark Chocolate",
            "size": "M",
            "quantity": 1,
            "price": 72000
        }
    ]
    cursor.execute('''
    INSERT OR REPLACE INTO orders (
        id, customer_name, customer_email, total_amount, currency, items_json, status, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        "ORD-2026-001", "Gudrun Sigurdardottir", "gudrun@reykjavik.is",
        72000, "ISK", json.dumps(demo_order_items), "in_preparation", "Complimentary gift packaging requested", now
    ))

    conn.commit()
    print("✓ Forméli & Co. Database initialized and seeded successfully.")

# ==============================================================================
# HTTP & REST API Request Handler
# ==============================================================================
class FormeliCMSHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def translate_path(self, path):
        if path == '/admin' or path == '/admin/':
            path = '/admin.html'
        return super().translate_path(path)

    def is_public_file(self):
        path = urllib.parse.unquote(urllib.parse.urlparse(self.path).path)
        if path in ('/', '/index.html', '/admin', '/admin/', '/admin.html',
                    '/app.js', '/admin.js', '/products.js', '/style.css'):
            return True
        if not path.startswith('/assets/'):
            return False
        target = os.path.realpath(self.translate_path(self.path))
        assets_dir = os.path.realpath(os.path.join(BASE_DIR, 'assets'))
        return (os.path.commonpath([target, assets_dir]) == assets_dir
                and os.path.isfile(target)
                and os.path.splitext(target)[1].lower() in
                ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg',
                 '.ico', '.woff', '.woff2', '.mp4', '.webm'))

    def do_HEAD(self):
        if not self.is_public_file():
            self.send_error(404, 'Not Found')
            return
        if urllib.parse.urlparse(self.path).path in ('/admin', '/admin/'):
            self.path = '/admin.html'
        super().do_HEAD()

    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def send_json(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        if length > 0:
            raw = self.rfile.read(length).decode('utf-8')
            try:
                return json.loads(raw)
            except Exception:
                return None
        return {}

    # --------------------------------------------------------------------------
    # GET Endpoints
    # --------------------------------------------------------------------------
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Route /admin to admin.html
        if path == '/admin' or path == '/admin/':
            self.path = '/admin.html'
            return super().do_GET()

        # REST API Routes
        if path.startswith('/api/'):
            conn = get_db()
            cursor = conn.cursor()

            try:
                # 1. GET /api/stats (Dashboard statistics)
                if path == '/api/stats':
                    cursor.execute('SELECT COUNT(*) FROM products WHERE is_active = 1')
                    active_products = cursor.fetchone()[0]

                    cursor.execute('SELECT COUNT(*) FROM orders')
                    total_orders = cursor.fetchone()[0]

                    cursor.execute('SELECT SUM(total_amount) FROM orders WHERE currency = "ISK"')
                    revenue_isk = cursor.fetchone()[0] or 0

                    cursor.execute('SELECT COUNT(*) FROM subscribers')
                    total_subscribers = cursor.fetchone()[0]

                    cursor.execute('SELECT COUNT(*) FROM journal_articles')
                    total_articles = cursor.fetchone()[0]

                    self.send_json({
                        "success": True,
                        "data": {
                            "active_products": active_products,
                            "total_orders": total_orders,
                            "revenue_isk": revenue_isk,
                            "total_subscribers": total_subscribers,
                            "total_articles": total_articles
                        }
                    })
                    return

                # 2. GET /api/products
                if path == '/api/products':
                    include_all = query.get('all', ['0'])[0] == '1'
                    sql = 'SELECT * FROM products ORDER BY is_signature DESC, created_at DESC' if include_all else 'SELECT * FROM products WHERE is_active = 1 ORDER BY is_signature DESC, created_at DESC'
                    cursor.execute(sql)
                    rows = cursor.fetchall()
                    products = []
                    for r in rows:
                        p = dict(r)
                        p['sizes'] = json.loads(p['sizes_json'] or '[]')
                        p['colors'] = json.loads(p['colors_json'] or '[]')
                        p['priceEUR'] = p['price_eur']
                        p['priceISK'] = p['price_isk']
                        p['priceUSD'] = p['price_usd']
                        p['isNew'] = bool(p['is_new'])
                        p['isSignature'] = bool(p['is_signature'])
                        p['isActive'] = bool(p['is_active'])
                        p['categoryKey'] = p['category_key']
                        p['reviewsCount'] = p['reviews_count']
                        del p['sizes_json'], p['colors_json']
                        products.append(p)
                    self.send_json({"success": True, "data": products})
                    return

                # 3. GET /api/content
                if path == '/api/content':
                    cursor.execute('SELECT * FROM content_blocks')
                    rows = cursor.fetchall()
                    content = {}
                    for r in rows:
                        content[r['key']] = json.loads(r['value_json'])
                    self.send_json({"success": True, "data": content})
                    return

                # 4. GET /api/journal
                if path == '/api/journal':
                    cursor.execute('SELECT * FROM journal_articles ORDER BY created_at DESC')
                    rows = cursor.fetchall()
                    articles = [dict(r) for r in rows]
                    self.send_json({"success": True, "data": articles})
                    return

                # 5. GET /api/orders
                if path == '/api/orders':
                    cursor.execute('SELECT * FROM orders ORDER BY created_at DESC')
                    rows = cursor.fetchall()
                    orders = []
                    for r in rows:
                        ord_dict = dict(r)
                        ord_dict['items'] = json.loads(ord_dict['items_json'] or '[]')
                        del ord_dict['items_json']
                        orders.append(ord_dict)
                    self.send_json({"success": True, "data": orders})
                    return

                # 6. GET /api/subscribers
                if path == '/api/subscribers':
                    cursor.execute('SELECT * FROM subscribers ORDER BY created_at DESC')
                    rows = cursor.fetchall()
                    subs = [dict(r) for r in rows]
                    self.send_json({"success": True, "data": subs})
                    return

                # 7. GET /api/promos
                if path == '/api/promos':
                    cursor.execute('SELECT * FROM promo_codes ORDER BY created_at DESC')
                    rows = cursor.fetchall()
                    promos = [dict(r) for r in rows]
                    self.send_json({"success": True, "data": promos})
                    return

                # 8. GET /api/backup (Export full database as JSON)
                if path == '/api/backup':
                    cursor.execute('SELECT * FROM products')
                    products = [dict(r) for r in cursor.fetchall()]
                    cursor.execute('SELECT * FROM content_blocks')
                    content = [dict(r) for r in cursor.fetchall()]
                    cursor.execute('SELECT * FROM journal_articles')
                    journal = [dict(r) for r in cursor.fetchall()]
                    cursor.execute('SELECT * FROM orders')
                    orders = [dict(r) for r in cursor.fetchall()]
                    cursor.execute('SELECT * FROM subscribers')
                    subs = [dict(r) for r in cursor.fetchall()]
                    cursor.execute('SELECT * FROM promo_codes')
                    promos = [dict(r) for r in cursor.fetchall()]

                    backup_data = {
                        "version": "1.0",
                        "brand": "FORMÉLI & CO.",
                        "exported_at": datetime.utcnow().isoformat(),
                        "products": products,
                        "content_blocks": content,
                        "journal_articles": journal,
                        "orders": orders,
                        "subscribers": subs,
                        "promo_codes": promos
                    }
                    self.send_json({"success": True, "data": backup_data})
                    return

                self.send_json({"success": False, "error": "Not Found"}, 404)
            finally:
                conn.close()
            return

        # Fallback to standard static file server
        if not self.is_public_file():
            self.send_error(404, 'Not Found')
            return
        super().do_GET()

    # --------------------------------------------------------------------------
    # POST Endpoints
    # --------------------------------------------------------------------------
    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.read_body()
        conn = get_db()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()

        try:
            # 1. POST /api/products
            if path == '/api/products':
                p_id = body.get('id') or f"prod-{int(datetime.utcnow().timestamp())}"
                cursor.execute('''
                INSERT INTO products (
                    id, name, category, category_key, price_eur, price_isk, price_usd,
                    rating, reviews_count, is_new, is_signature, is_active,
                    tagline, composition, care, sizes_json, colors_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    p_id,
                    body.get('name', 'New Piece'),
                    body.get('category', 'Essentials'),
                    body.get('category_key', 'essentials'),
                    float(body.get('price_eur', 0)),
                    float(body.get('price_isk', 0)),
                    float(body.get('price_usd', 0)),
                    float(body.get('rating', 5.0)),
                    int(body.get('reviews_count', 0)),
                    1 if body.get('is_new') else 0,
                    1 if body.get('is_signature', 1) else 0,
                    1 if body.get('is_active', 1) else 0,
                    body.get('tagline', ''),
                    body.get('composition', ''),
                    body.get('care', ''),
                    json.dumps(body.get('sizes', ["XS", "S", "M", "L"])),
                    json.dumps(body.get('colors', [])),
                    now
                ))
                conn.commit()
                self.send_json({"success": True, "message": "Product created successfully", "id": p_id}, 201)
                return

            # 2. POST /api/orders (Storefront checkout simulation)
            if path == '/api/orders':
                ord_id = body.get('id') or f"ORD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
                cursor.execute('''
                INSERT INTO orders (
                    id, customer_name, customer_email, total_amount, currency, items_json, status, notes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    ord_id,
                    body.get('customer_name', 'VIP Customer'),
                    body.get('customer_email', 'client@formeli.is'),
                    float(body.get('total_amount', 0)),
                    body.get('currency', 'ISK'),
                    json.dumps(body.get('items', [])),
                    body.get('status', 'pending'),
                    body.get('notes', ''),
                    now
                ))
                conn.commit()
                self.send_json({"success": True, "order_id": ord_id, "message": "Order created successfully"}, 201)
                return

            # 3. POST /api/subscribers (Newsletter subscribe)
            if path == '/api/subscribers':
                email = (body.get('email') or '').strip().lower()
                if not email or '@' not in email:
                    self.send_json({"success": False, "error": "Invalid email address"}, 400)
                    return
                try:
                    cursor.execute('INSERT INTO subscribers (email, created_at) VALUES (?, ?)', (email, now))
                    conn.commit()
                    self.send_json({"success": True, "message": "Subscribed successfully to Forméli VIP Circle"})
                except sqlite3.IntegrityError:
                    self.send_json({"success": True, "message": "Already subscribed"})
                return

            # 4. POST /api/journal
            if path == '/api/journal':
                art_id = body.get('id') or f"journal-{int(datetime.utcnow().timestamp())}"
                cursor.execute('''
                INSERT INTO journal_articles (
                    id, tag, title, summary, date_str, read_time, image, content, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    art_id,
                    body.get('tag', 'EDITORIAL'),
                    body.get('title', 'New Article'),
                    body.get('summary', ''),
                    body.get('date_str', datetime.utcnow().strftime('%B %Y')),
                    body.get('read_time', '5 min read'),
                    body.get('image', ''),
                    body.get('content', ''),
                    now
                ))
                conn.commit()
                self.send_json({"success": True, "id": art_id, "message": "Article published successfully"}, 201)
                return

            # 5. POST /api/promos
            if path == '/api/promos':
                code = (body.get('code') or '').strip().upper()
                percent = float(body.get('discount_percent', 10.0))
                cursor.execute('INSERT OR REPLACE INTO promo_codes (code, discount_percent, is_active, created_at) VALUES (?, ?, ?, ?)',
                               (code, percent, 1, now))
                conn.commit()
                self.send_json({"success": True, "message": f"Promo code {code} created"}, 201)
                return

            # 6. POST /api/restore (Reset to factory initial seed)
            if path == '/api/restore':
                cursor.execute('DELETE FROM products')
                cursor.execute('DELETE FROM content_blocks')
                cursor.execute('DELETE FROM journal_articles')
                cursor.execute('DELETE FROM promo_codes')
                seed_initial_data(conn)
                self.send_json({"success": True, "message": "Database restored to original Forméli & Co. catalog"})
                return

            self.send_json({"success": False, "error": "Not Found"}, 404)
        finally:
            conn.close()

    # --------------------------------------------------------------------------
    # PUT Endpoints (Update)
    # --------------------------------------------------------------------------
    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.read_body()
        conn = get_db()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()

        try:
            # 1. PUT /api/products/:id
            if path.startswith('/api/products/'):
                p_id = path.split('/api/products/')[1]
                cursor.execute('''
                UPDATE products SET
                    name = ?, category = ?, category_key = ?,
                    price_eur = ?, price_isk = ?, price_usd = ?,
                    rating = ?, is_new = ?, is_signature = ?, is_active = ?,
                    tagline = ?, composition = ?, care = ?,
                    sizes_json = ?, colors_json = ?
                WHERE id = ?
                ''', (
                    body.get('name'),
                    body.get('category'),
                    body.get('category_key'),
                    float(body.get('price_eur', 0)),
                    float(body.get('price_isk', 0)),
                    float(body.get('price_usd', 0)),
                    float(body.get('rating', 5.0)),
                    1 if body.get('is_new') else 0,
                    1 if body.get('is_signature', 1) else 0,
                    1 if body.get('is_active', 1) else 0,
                    body.get('tagline', ''),
                    body.get('composition', ''),
                    body.get('care', ''),
                    json.dumps(body.get('sizes', [])),
                    json.dumps(body.get('colors', [])),
                    p_id
                ))
                conn.commit()
                self.send_json({"success": True, "message": "Product updated successfully"})
                return

            # 2. PUT /api/content/:key
            if path.startswith('/api/content/'):
                key = path.split('/api/content/')[1]
                cursor.execute('INSERT OR REPLACE INTO content_blocks (key, value_json, updated_at) VALUES (?, ?, ?)',
                               (key, json.dumps(body), now))
                conn.commit()
                self.send_json({"success": True, "message": f"Content block '{key}' updated successfully"})
                return

            # 3. PUT /api/orders/:id (Update order status)
            if path.startswith('/api/orders/'):
                ord_id = path.split('/api/orders/')[1]
                status = body.get('status', 'in_preparation')
                cursor.execute('UPDATE orders SET status = ? WHERE id = ?', (status, ord_id))
                conn.commit()
                self.send_json({"success": True, "message": f"Order {ord_id} updated to {status}"})
                return

            # 4. PUT /api/journal/:id
            if path.startswith('/api/journal/'):
                art_id = path.split('/api/journal/')[1]
                cursor.execute('''
                UPDATE journal_articles SET
                    tag = ?, title = ?, summary = ?, date_str = ?, read_time = ?, image = ?, content = ?
                WHERE id = ?
                ''', (
                    body.get('tag'), body.get('title'), body.get('summary'),
                    body.get('date_str'), body.get('read_time'), body.get('image'), body.get('content'),
                    art_id
                ))
                conn.commit()
                self.send_json({"success": True, "message": "Article updated successfully"})
                return

            self.send_json({"success": False, "error": "Not Found"}, 404)
        finally:
            conn.close()

    # --------------------------------------------------------------------------
    # DELETE Endpoints
    # --------------------------------------------------------------------------
    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        conn = get_db()
        cursor = conn.cursor()

        try:
            # 1. DELETE /api/products/:id
            if path.startswith('/api/products/'):
                p_id = path.split('/api/products/')[1]
                cursor.execute('DELETE FROM products WHERE id = ?', (p_id,))
                conn.commit()
                self.send_json({"success": True, "message": f"Product {p_id} deleted"})
                return

            # 2. DELETE /api/journal/:id
            if path.startswith('/api/journal/'):
                art_id = path.split('/api/journal/')[1]
                cursor.execute('DELETE FROM journal_articles WHERE id = ?', (art_id,))
                conn.commit()
                self.send_json({"success": True, "message": f"Article {art_id} deleted"})
                return

            # 3. DELETE /api/promos/:code
            if path.startswith('/api/promos/'):
                code = path.split('/api/promos/')[1]
                cursor.execute('DELETE FROM promo_codes WHERE code = ?', (code,))
                conn.commit()
                self.send_json({"success": True, "message": f"Promo code {code} removed"})
                return

            self.send_json({"success": False, "error": "Not Found"}, 404)
        finally:
            conn.close()

# ==============================================================================
# Main Runner
# ==============================================================================
def run(port=PORT):
    init_db()
    # This development CMS has no authentication yet; keep it on this machine.
    server_address = ('127.0.0.1', port)
    httpd = HTTPServer(server_address, FormeliCMSHandler)
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"✨ FORMÉLI & CO. — CMS & STOREFRONT SERVER READY")
    print(f"🌐 Storefront:      http://localhost:{port}/")
    print(f"🛠️  Admin Portal:    http://localhost:{port}/admin")
    print(f"📡 REST API Root:   http://localhost:{port}/api/products")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully.")
        httpd.server_close()

if __name__ == '__main__':
    run()

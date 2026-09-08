/*
 * Jalisco Brews & Bites — Obsidian Luxury system.
 * Deep charcoal, warm gold, crimson ember, amber light, glass surfaces,
 * cinematic motion, and direct reservation-first interactions.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import type { Group, Points } from "three";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Instagram,
  LoaderCircle,
  MapPin,
  Menu as MenuIcon,
  Phone,
  Sparkles,
  Star,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
      fetchGallery,
      fetchMenu,
      type MenuCategory,
      type PaymentMethod,
      type ReservationPayload,
} from "@/services/api";

const asset = {
  hero: "/images/jalisco-hero.jpg",
  mark: "/images/jalisco-logo.png",
  dish: "/images/jalisco-dish.jpg",
  interior: "/images/jalisco-interior.jpg",
  cocktail: "/images/jalisco-cocktail.jpg",
};

const fallbackMenu: MenuCategory[] = [
  {
    name: "Soulful Soups",
    items: [
      { name: "Himalayan Thukpa Revival", description: "A soul-warming noodle broth infused with ginger, seasonal vegetables, Szechwan chili dust, and crispy garlic flakes.", price: "₹445 (Veg) / ₹499 (Chicken)", isVeg: true, spicyLevel: 1 },
      { name: "Cream Of Mushroom Soup", description: "Creamy wild mushroom soup blended with roasted garlic crème and finished with a drizzle of white truffle oil.", price: "₹499", isVeg: true, spicyLevel: 0 },
      { name: "Lemon Coriander Soup", description: "A light and refreshing broth infused with fresh coriander, zesty lemon, and a gentle garlic hit perfect to awaken the palate.", price: "₹399", isVeg: true, spicyLevel: 0 },
      { name: "Oriental Manchow Brew", description: "A hearty vegetable soup infused with garlic, soy, and mild spices, finished with crispy noodles.", price: "₹399 (Veg) / ₹445 (Chicken)", isVeg: true, spicyLevel: 1 },
    ],
  },
  {
    name: "Fresh & Flavorful Salads",
    items: [
      { name: "Avocado, Raw Mango & Arugula Zing", description: "A tropical tango of flavours — buttery avocado and tangy raw mango tossed with chili-mango vinaigrette for the perfect balance of heat and freshness.", price: "₹629", isVeg: true, spicyLevel: 1 },
      { name: "Black Beans Glow Bowl", description: "Protein-packed black beans, ripe mango, and sprouted grains tossed in a lively chili-lime vinaigrette, garnished with micro cilantro and toasted coconut flakes.", price: "₹499", isVeg: true, spicyLevel: 1 },
      { name: "Greek Garden Salad", description: "Crisp lettuce, cucumber, olives, tomatoes, and feta tossed in a classic olive oil dressing.", price: "₹499", isVeg: true, spicyLevel: 0 },
      { name: "Classic Caesar Salad Bowl", description: "Fresh romaine lettuce with creamy Caesar dressing, parmesan shavings, and crunchy croutons. Add-on: grilled chicken ₹199.", price: "₹499", isVeg: true, spicyLevel: 0 },
    ],
  },
  {
    name: "Beer Nibbles",
    items: [
      { name: "Chakna Remix Board", description: "BBQ spiced nuts (cashew, almond, peanuts, raisins), crunchy masala makhana, bakharwadi, wasabi pea bhel, and masala onion rings — a perfect companion for your drink.", price: "₹999", isVeg: true, spicyLevel: 1 },
      { name: "Classic Nachos", description: "Crunchy tortilla chips topped with melted cheese and jalapeños, served with salsa, sour cream, and guacamole.", price: "₹549", isVeg: true, spicyLevel: 1 },
      { name: "Cheese Garlic Bread", description: "Freshly baked bread brushed with buttery garlic spread, topped with melted cheese and toasted golden and crisp. (4 pcs)", price: "₹449", isVeg: true, spicyLevel: 0 },
      { name: "Garlic Chilli Bread", description: "Crispy toasted bread brushed with buttery garlic, topped with fiery chilli flakes and herbs. (4 pcs)", price: "₹399", isVeg: true, spicyLevel: 2 },
      { name: "Twice-Fried House Fries", description: "Golden fries, twice-fried for ultimate crispness. Choose classic, spicy peri peri, or smothered in melty cheese lava.", price: "₹345 / ₹375 / ₹399", isVeg: true, spicyLevel: 1 },
      { name: "Peri Peri Corn & Veggies", description: "Sweet golden corn and bell peppers tossed in our signature house peri peri spice powder.", price: "₹499", isVeg: true, spicyLevel: 1 },
      { name: "Planted Sesame Chili Potato Wedges", description: "Crunchy Asian-style potato wedges glazed with sesame and garnished with scallion threads.", price: "₹499", isVeg: true, spicyLevel: 1 },
      { name: "Crispy Mushroom Bites", description: "Crispy button mushrooms tossed in a basil-forward seasoning.", price: "₹629", isVeg: true, spicyLevel: 0 },
      { name: "Kaju Masala", description: "Roasted cashew nuts tossed in a fiery peri peri spice blend with aromatic herbs and a hint of tangy lemon.", price: "₹549", isVeg: true, spicyLevel: 2 },
      { name: "Fire Lotus Wafers", description: "Crunchy lotus root roasted with peri peri spice and herbs, delivering a fiery, tangy punch.", price: "₹449", isVeg: true, spicyLevel: 2 },
      { name: "Fiery Chilli Potato", description: "Crisp fried potatoes tossed in chilli-garlic sauce.", price: "₹479", isVeg: true, spicyLevel: 2 },
      { name: "Peanut Masala Reloaded", description: "A bold, spicy-savoury peanut mix with onions, herbs, lemon, and a hint of crunch.", price: "₹449", isVeg: true, spicyLevel: 1 },
      { name: "Crispy Chicken Fingers & Fries", description: "Tender chicken strips, perfectly breaded and fried, served with golden French fries and house dip.", price: "₹579", isVeg: false, spicyLevel: 1 },
      { name: "Spiced Chicken Pakoda & Chips", description: "Crunchy, spiced chicken fritters served with crispy chips and tangy chutney.", price: "₹579", isVeg: false, spicyLevel: 1 },
      { name: "Chicken Popcorn", description: "Crunchy, bite-sized chicken nuggets served on a bed of masala popcorn with smoky chipotle mayo and crispy fries.", price: "₹629", isVeg: false, spicyLevel: 1 },
    ],
  },
  {
    name: "Vegetarian Indian Appetizers",
    items: [
      { name: "Dabeli On Wheels", description: "Spicy, tangy, and sweet mashed potato filling inside soft bread, topped with crunchy sev, spicy peanuts, and pomegranate. Street-style, served on-the-go.", price: "₹529", isVeg: true, spicyLevel: 2 },
      { name: "Modern Aloo Tikki Chaat", description: "Classic spiced potato patties served with tamarind gel, sweet yogurt, chili pearls, and sev tuile.", price: "₹499", isVeg: true, spicyLevel: 1 },
      { name: "Beetroot Cheesy Bomb", description: "Roasted beetroot stuffed with creamy Greek yogurt, served with apricot chutney.", price: "₹599", isVeg: true, spicyLevel: 0 },
      { name: "Tandoori Cheese-Stuffed Mushrooms", description: "Button mushrooms stuffed with herbed cottage cheese and veggies, roasted in the tandoor, served with chili-yogurt mint dip.", price: "₹629", isVeg: true, spicyLevel: 1 },
      { name: "Avocado Burrata Chaat", description: "Creamy avocado smash and fresh burrata tossed with chaat masala, drizzled with pesto, served with crunchy crisps.", price: "₹749", isVeg: true, spicyLevel: 1 },
      { name: "Tandoori Stuffed Soya Chaap", description: "Soft soya chaap filled with cheesy herb vegetables, marinated in tandoori blend and roasted, served with tomato chutney and tandoori mayo.", price: "₹599", isVeg: true, spicyLevel: 1 },
      { name: "Jalisco Special Sikandari Paneer Roll", description: "Paneer roulade stuffed with spiced mushrooms, roasted to perfection, served with charred black bean sauce, raw mango relish, and mint chutney.", price: "₹699", isVeg: true, spicyLevel: 1 },
      { name: "Malai Stuffed Soya Chaap", description: "Soya chaap filled with cheesy herb vegetables, marinated in a creamy blend and roasted, served with tomato chutney and tandoori mayo.", price: "₹649", isVeg: true, spicyLevel: 0 },
      { name: "Malai Broccoli Bites", description: "Charred broccoli glazed with malai sauce, served on a bed of yellow lentil purée, garnished with lotus chips.", price: "₹629", isVeg: true, spicyLevel: 0 },
      { name: "Paneer Seekh Kebab", description: "Minced paneer blended with aromatic spices, skewered and grilled, served with heirloom tomato chutney and mint sauce.", price: "₹629", isVeg: true, spicyLevel: 1 },
      { name: "Rajma Galouti Kebab", description: "Mini paratha discs topped with kidney bean kebabs, paprika labneh, and spicy chili-garlic chutney.", price: "₹599", isVeg: true, spicyLevel: 1 },
      { name: "Paneer Tikka Two Ways", description: "A duo of classic tandoori paneer and chimichurri-pepper flavours, served with pipid sauce and herb chutney.", price: "₹649", isVeg: true, spicyLevel: 1 },
      { name: "Mushroom Galouti Kebabs", description: "Mushroom galoutis served with flaky warqi paratha, thyme yogurt, mint, and mango kasundi emulsion.", price: "₹599", isVeg: true, spicyLevel: 1 },
      { name: "Doughnut Yogurt Kebab", description: "Crispy yogurt kebabs shaped like doughnuts, stuffed with dry fruits and herbs and topped with chaat toppings, avocado mousse, and mint chutney.", price: "₹649", isVeg: true, spicyLevel: 0 },
      { name: "Royal Tandoori Gobhi Medallion", description: "Thick-cut cauliflower florets marinated in robust tandoori spices, fire-roasted to a smoky char, served with pickled onion, crispy curry leaf dust, and mint-coriander chutney.", price: "₹589", isVeg: true, spicyLevel: 1 },
    ],
  },
  {
    name: "Non-Veg Indian Appetizers",
    items: [
      { name: "Laal Murgh Tikka", description: "Traditional chicken tikka served with mint-lime chutney.", price: "₹699", isVeg: false, spicyLevel: 1 },
      { name: "Chicken Leg Bhatti", description: "Rustic bhatti-style chicken leg served with burnt garlic curd and masala onion laccha.", price: "₹699", isVeg: false, spicyLevel: 1 },
      { name: "Tribal Bamboo Chicken Tikka", description: "Slow-cooked chicken with burnt onion-forest herb jus, plated in a bamboo charred leaf parcel with pearl onions and mint chutney.", price: "₹699", isVeg: false, spicyLevel: 1 },
      { name: "Spicy Hyderabadi Chicken Lollipops", description: "Juicy tandoori chicken lollipops dry tossed in spicy makhani gravy, paired with aloo jeera salad and fried green chilli.", price: "₹629", isVeg: false, spicyLevel: 2 },
      { name: "Olive Chicken Tikka", description: "Chicken tikka with olive tapenade raita, tomato-mustard emulsion, and olive crumble.", price: "₹699", isVeg: false, spicyLevel: 1 },
      { name: "Lamb Seekh Tawa Masala", description: "Charred lamb seekh kebabs tossed in spicy masala, served over masala onions or masala pav.", price: "₹799", isVeg: false, spicyLevel: 2 },
      { name: "Mexican Chicken Tikka", description: "Fiery chicken tikka marinated in chili sauce and chili butter drizzle, plated with grilled pineapple and peanut crisp.", price: "₹699", isVeg: false, spicyLevel: 2 },
      { name: "Lamb Belly Galouti Melt", description: "Melt-in-mouth lamb belly galouti with rose and kewra flavours, served on flavoured bread with mint chutney and harissa mayo.", price: "₹799", isVeg: false, spicyLevel: 1 },
      { name: "Cheesy Malai Chicken Tikka", description: "Chicken tikka topped with cheesy malai, finished with malai onions and edible flowers.", price: "₹729", isVeg: false, spicyLevel: 0 },
      { name: "Slow-Fire Maharashtrian Lamb Chops", description: "Marathi-style slow-cooked mutton curry with goda masala, served with ghee rice.", price: "₹829", isVeg: false, spicyLevel: 2 },
      { name: "Tandoori Tangri Kebab", description: "Char-grilled chicken leg marinated in spiced hung curd, served with smoked paprika yogurt and onion-mint salad.", price: "₹649", isVeg: false, spicyLevel: 1 },
      { name: "Punjabi Fish Tikka", description: "Yellow spiced fish roasted in the tandoor, served with mustard mayonnaise, chips, and fried garlic.", price: "₹799", isVeg: false, spicyLevel: 1 },
      { name: "Sharabi Chicken Wings", description: "Whiskey-infused tandoori chicken wings glazed in spice mix, served with green chili chutney.", price: "₹649", isVeg: false, spicyLevel: 2 },
      { name: "Tandoori Prawns Mango Salsa", description: "Clay oven-roasted prawns paired with tangy mango salsa, chili-lime glaze, fennel salt dust, and masala fries.", price: "₹1099", isVeg: false, spicyLevel: 2 },
      { name: "Vegetarian House Platter", description: "Tasting platter (9 pcs): achari paneer tikka, dahi kebab, tandoori soya chaap.", price: "₹1199", isVeg: true, spicyLevel: 1 },
      { name: "Non-Vegetarian House Platter", description: "Tasting platter (9 pcs): classic murgh tikka, fish tikka, mutton seekh.", price: "₹1399", isVeg: false, spicyLevel: 1 },
    ],
  },
  {
    name: "European Appetizers",
    items: [
      { name: "Bowl-E-Falafel", description: "Chickpea falafel served with classic hummus and pita.", price: "₹599", isVeg: true, spicyLevel: 0 },
      { name: "Pesto Fish & Chips", description: "Classic British-style crispy fish served with golden chips, green pea mash, and tangy tartar sauce.", price: "₹799", isVeg: false, spicyLevel: 0 },
      { name: "Smashed Avocado Toast", description: "Rustic sourdough toast topped with creamy avocado, cherry tomatoes, olive oil, and parmesan cheese.", price: "₹749", isVeg: true, spicyLevel: 0 },
      { name: "Charred Chicken With Chilli-Lime Glaze", description: "Grilled boneless thigh with citrus-chili marinade, plated with charred baby potatoes and scallion aioli.", price: "₹699", isVeg: false, spicyLevel: 1 },
      { name: "Amritsari Chole Hummus With Taftan Bread", description: "Spiced chickpea hummus served with soft taftan bread.", price: "₹599", isVeg: true, spicyLevel: 1 },
      { name: "Peri Peri Roasted Chicken", description: "Fiery Portuguese peri peri-marinated chicken, finished with grilled lemon, house salad, and garlic aioli.", price: "₹649", isVeg: false, spicyLevel: 2 },
      { name: "Corn And Paneer Tacos", description: "Soft corn tortillas filled with seasoned sautéed corn and paneer, topped with guacamole, lettuce, and a tangy salsa.", price: "₹549", isVeg: true, spicyLevel: 1 },
      { name: "Chicken Chettinad Crispy Tacos", description: "Crispy taco shells, Chettinad-style chicken, curry leaves, black pepper, fennel, onion slaw, and coconut mayo.", price: "₹629", isVeg: false, spicyLevel: 2 },
      { name: "Grilled Veggie & Cheese Quesadilla", description: "A mix of roasted bell peppers, zucchini, corn, and jalapeños with melted cheese and chipotle aioli.", price: "₹549", isVeg: true, spicyLevel: 1 },
      { name: "Pulled Chicken Taco", description: "A soft-shell taco filled with lettuce, seasoned pulled chicken, beans, tomatoes, cheese, and topped with sour cream and guacamole.", price: "₹629", isVeg: false, spicyLevel: 1 },
      { name: "Crispy Paneer Shawarma Wrap", description: "Crisp golden paneer, pickled veggies, and za'atar onion slaw wrapped in soft pita with spiced fries, classic hummus, harissa, and lebneh.", price: "₹599", isVeg: true, spicyLevel: 1 },
      { name: "Chicken Adana Kebab", description: "Chargrilled minced chicken kebab served with sumac onions, flatbread, and garlic yogurt dip.", price: "₹699", isVeg: false, spicyLevel: 1 },
      { name: "Crispy Chicken Shawarma Wrap", description: "Crisp golden chicken, pickled veggies, and za'atar onion slaw wrapped in soft pita with spiced fries, classic hummus, harissa, and lebneh.", price: "₹629", isVeg: false, spicyLevel: 1 },
      { name: "Mutton Adana Kebab", description: "Spicy minced mutton kebab grilled on skewers, served with tomato, warm flatbread, and grilled chili.", price: "₹799", isVeg: false, spicyLevel: 2 },
      { name: "Turkish Non-Veg Grill Platter", description: "Chicken joojeh, chicken adana, mutton adana, Turkish chicken tikka, grilled chicken wings, spiced fish skewers served with pita bread, lavash, garlic toum, sumac onions, grilled tomato & chili, ezme salsa, pickled vegetables. Please allow 30–35 minutes preparation time.", price: "₹2799", isVeg: false, spicyLevel: 1 },
      { name: "Grand Mezze Platter (Veg)", description: "A colourful, flavour-packed Mediterranean tasting board: classic hummus, BBQ hummus, chili hummus, muhammara, babaganoush, haydari, crispy falafels, spring rolls, pocket mushroom, grilled cottage cheese, marinated olives, pickled vegetables, with warm pita, lavash, taftan, and breadsticks. Please allow 30–35 minutes preparation time.", price: "₹1899", isVeg: true, spicyLevel: 1 },
    ],
  },
  {
    name: "Veg Pizzeria (10 inches)",
    items: [
      { name: "Classic Margherita (Napoletana Style)", description: "Traditional tomato sauce, fresh mozzarella, and basil on a thin, airy crust.", price: "₹699", isVeg: true, spicyLevel: 0 },
      { name: "Basil Pesto Burrata Pizza (Napoletana Style)", description: "Creamy burrata, house-made basil pesto, fresh tomatoes, and arugula.", price: "₹899", isVeg: true, spicyLevel: 0 },
      { name: "Veg Extravaganza", description: "Loaded with black olives, onions, capsicum, mushrooms, golden corn, jalapeños, and extra cheese.", price: "₹749", isVeg: true, spicyLevel: 1 },
      { name: "Tandoori Paneer Tikka Pizza", description: "Spiced paneer tikka, bell peppers, onions, and green chili on a bold Indian base.", price: "₹799", isVeg: true, spicyLevel: 1 },
      { name: "Cheese, Corn, Mushroom And Onion Pizza", description: "Sweet golden corn and extra cheese melted over a soft, cheesy crust.", price: "₹799", isVeg: true, spicyLevel: 0 },
    ],
  },
  {
    name: "Non-Veg Pizzas",
    items: [
      { name: "Chicken Dominator", description: "Loaded with grilled chicken, chicken tikka, and spiced chicken sausage. Add-ons: cheese ₹199, chicken ₹199.", price: "₹899", isVeg: false, spicyLevel: 1 },
      { name: "Tandoori Chicken Tikka Pizza", description: "Tandoori chicken, onions, bell peppers, and green chili on a spiced tomato base.", price: "₹849", isVeg: false, spicyLevel: 1 },
      { name: "Spicy Chicken Sausage Pizza", description: "Sliced chicken sausage with jalapeños and red peppers for a bold, fiery flavour.", price: "₹899", isVeg: false, spicyLevel: 2 },
      { name: "Roasted Peri Peri Chicken Pizza", description: "Grilled peri peri chicken with onions and bell peppers, finished with a creamy peri-peri drizzle.", price: "₹799", isVeg: false, spicyLevel: 1 },
      { name: "Grilled Chicken Pizza", description: "Thin-crust pizza topped with grilled chicken, olives, bell peppers, onions, and za'atar seasoning.", price: "₹729", isVeg: false, spicyLevel: 0 },
    ],
  },
  {
    name: "European Mains",
    items: [
      { name: "Spinach, Corn And Mushroom Ravioli", description: "Delicate ravioli stuffed with spinach, sweet corn, and mushrooms, served with a light herb cream sauce.", price: "₹649", isVeg: true, spicyLevel: 0 },
      { name: "Jackfruit Lasagne", description: "Layers of tender jackfruit, tomato sauce, béchamel, and cheese baked to perfection.", price: "₹599", isVeg: true, spicyLevel: 0 },
      { name: "Grilled Cottage Cheese", description: "Marinated and grilled cottage cheese served with sautéed vegetables and a tangy dressing.", price: "₹629", isVeg: true, spicyLevel: 0 },
      { name: "Lal Maans Bolognese Ravioli", description: "Ravioli filled with spiced minced lamb in a rich lal maans sauce.", price: "₹799", isVeg: false, spicyLevel: 2 },
      { name: "Grilled Butterfly Chicken", description: "Marinated and grilled butterfly-cut chicken served with herb-infused gravy, seasonal vegetables, mash, and corn on the cob.", price: "₹699", isVeg: false, spicyLevel: 0 },
      { name: "Grilled Sole Fish", description: "Lightly seasoned sole fish fillet grilled to perfection, served with seasonal vegetables, mash, corn on the cob, and lemon herbs.", price: "₹849", isVeg: false, spicyLevel: 0 },
    ],
  },
  {
    name: "Pasta Station",
    items: [
      { name: "Classic Tomato Cream Pasta", description: "Choice of penne or spaghetti in a classic tomato cream sauce.", price: "₹599", isVeg: true, spicyLevel: 0 },
      { name: "Cheesy Alfredo Veg Pasta", description: "Choice of penne or spaghetti in a rich, cheesy alfredo sauce. Add-ons: veg ₹149, cheese ₹199, chicken ₹199.", price: "₹599", isVeg: true, spicyLevel: 0 },
      { name: "Spicy Arrabbiata Pasta", description: "Choice of penne or spaghetti tossed in a fiery tomato arrabbiata sauce.", price: "₹599", isVeg: true, spicyLevel: 2 },
      { name: "Basil Pesto Pasta", description: "Choice of penne or spaghetti tossed in fresh house-made basil pesto.", price: "₹629", isVeg: true, spicyLevel: 0 },
      { name: "Garlic & Olive Aglio Olio", description: "Choice of penne or spaghetti tossed in garlic, olive oil, and chili flakes.", price: "₹629", isVeg: true, spicyLevel: 1 },
    ],
  },
  {
    name: "Indian Veg Main Course",
    items: [
      { name: "Paneer Tikka Masala", description: "Grilled paneer cubes simmered in a smoky tandoori tomato cream sauce.", price: "₹599", isVeg: true, spicyLevel: 1 },
      { name: "Jalisco Cottage Cheese Green Peas Lasagne", description: "Velvety makhani-enriched layered cottage cheese with green peas.", price: "₹679", isVeg: true, spicyLevel: 0 },
      { name: "Royale Dal Makhani", description: "A luxurious black lentil stew slow-simmered overnight, served with butter naan and pickled shallots.", price: "₹599", isVeg: true, spicyLevel: 0 },
      { name: "Yellow Dal Tadka", description: "Split yellow moong lentils tempered with garlic, chilies, and pure ghee, served with steamed rice and papadum.", price: "₹549", isVeg: true, spicyLevel: 1 },
      { name: "Paneer Lababdar", description: "Velvety paneer cubes in a rich cashew-tomato gravy.", price: "₹649", isVeg: true, spicyLevel: 0 },
      { name: "Jalisco Kofta Curry", description: "Delicate zucchini dumplings in an aromatic curry sauce.", price: "₹649", isVeg: true, spicyLevel: 1 },
      { name: "Corn & Mushroom Curry", description: "Sweet corn, peas, and mushrooms tossed in a mild spiced sauce.", price: "₹599", isVeg: true, spicyLevel: 0 },
    ],
  },
  {
    name: "Chicken & Mutton Delicacies",
    items: [
      { name: "Butter Chicken", description: "Smoky, creamy butter chicken cooked in a classic tomato-based gravy.", price: "₹699", isVeg: false, spicyLevel: 0 },
      { name: "Murgh Lababdar", description: "Tender chicken simmered in a rich Mughlai cashew and tomato gravy.", price: "₹699", isVeg: false, spicyLevel: 0 },
      { name: "Kadai Chicken", description: "Spiced chicken sautéed with crunchy bell peppers in a bold kadai masala.", price: "₹699", isVeg: false, spicyLevel: 2 },
      { name: "Home Style Chicken Curry", description: "Traditional homestyle chicken curry with balanced spices and aromatics.", price: "₹679", isVeg: false, spicyLevel: 1 },
      { name: "Chicken Tikka Masala", description: "Grilled chicken chunks in a creamy spiced tomato sauce.", price: "₹689", isVeg: false, spicyLevel: 1 },
      { name: "Kashmiri Rogan Josh", description: "Lamb braised in chili-yogurt gravy with saffron.", price: "₹799", isVeg: false, spicyLevel: 2 },
      { name: "Mutton Champaran", description: "Mustard-oil slow-cooked mutton with whole spices.", price: "₹799", isVeg: false, spicyLevel: 1 },
      { name: "Nalli Nihari", description: "Fall-off-the-bone lamb shank in rich nihari broth.", price: "₹829", isVeg: false, spicyLevel: 1 },
    ],
  },
  {
    name: "Signature Biryani",
    items: [
      { name: "Cottage Cheese & Mushroom Dum Biryani", description: "Fragrant basmati layered with vegetables and biryani spices, served with raita and salan.", price: "₹629", isVeg: true, spicyLevel: 1 },
      { name: "Smoked Chicken Tikka Biryani", description: "Smoky chicken tikka layered with spiced basmati rice, served with raita and salan.", price: "₹699", isVeg: false, spicyLevel: 1 },
      { name: "Hand-Pounded Mutton Biryani", description: "Slow-cooked mutton with hand-ground spices and fragrant basmati rice, served with raita and salan.", price: "₹799", isVeg: false, spicyLevel: 1 },
    ],
  },
  {
    name: "Beer",
    items: [
      { name: "Draught (Ask For Tester Then Decide)", description: "500ml / 3L tower, served with fresh pizza.", price: "₹699 / ₹3999", isVeg: true, spicyLevel: 0 },
      { name: "Draught, 330ml (Ask For Tester Then Decide)", description: "330ml pour.", price: "₹525", isVeg: true, spicyLevel: 0 },
      { name: "Breezer (ask for flavours)", description: "330ml / bucket of 8 pints, with fresh pizza.", price: "₹499 / ₹3999", isVeg: true, spicyLevel: 0 },
      { name: "Kingfisher Premium", description: "330ml / bucket of 8 pints, with fresh pizza.", price: "₹499 / ₹3999", isVeg: true, spicyLevel: 0 },
      { name: "Kingfisher Ultra", description: "330ml / bucket of 8 pints, with fresh pizza.", price: "₹499 / ₹3999", isVeg: true, spicyLevel: 0 },
      { name: "Heineken", description: "330ml / bucket of 8 pints, with fresh pizza.", price: "₹525 / ₹4499", isVeg: true, spicyLevel: 0 },
      { name: "Carlsberg Smooth", description: "330ml / bucket of 8 pints, with fresh pizza.", price: "₹525 / ₹4499", isVeg: true, spicyLevel: 0 },
      { name: "Budweiser Lager", description: "330ml / bucket of 8 pints, with fresh pizza.", price: "₹525 / ₹4499", isVeg: true, spicyLevel: 0 },
      { name: "Tuborg", description: "330ml / bucket of 8 pints, with fresh pizza.", price: "₹525 / ₹4499", isVeg: true, spicyLevel: 0 },
      { name: "Bira White", description: "330ml / bucket of 8 pints, with fresh pizza.", price: "₹525 / ₹4499", isVeg: true, spicyLevel: 0 },
      { name: "Corona", description: "330ml / bucket of 8 pints, with fresh pizza.", price: "₹699 / ₹5499", isVeg: true, spicyLevel: 0 },
      { name: "Hoegaarden", description: "330ml / bucket of 8 pints, with fresh pizza.", price: "₹699 / ₹5499", isVeg: true, spicyLevel: 0 },
      { name: "Budweiser (Can)", description: "500ml can / bucket of 8 cans.", price: "₹725 / ₹5899", isVeg: true, spicyLevel: 0 },
      { name: "Budweiser Magnum (Can)", description: "500ml can / bucket of 8 cans.", price: "₹799 / ₹6299", isVeg: true, spicyLevel: 0 },
      { name: "Heineken (Can)", description: "500ml can / bucket of 8 cans.", price: "₹725 / ₹5899", isVeg: true, spicyLevel: 0 },
      { name: "Tuborg Classic (Can)", description: "500ml can / bucket of 8 cans.", price: "₹725 / ₹5899", isVeg: true, spicyLevel: 0 },
      { name: "Carlsberg Elephant (Can)", description: "500ml can / bucket of 8 cans.", price: "₹725 / ₹5899", isVeg: true, spicyLevel: 0 },
    ],
  },
  {
    name: "Single Malt",
    items: [
      { name: "Dalmore 12 Y.O.", description: "Single malt, 30ml pour.", price: "₹1099", isVeg: true, spicyLevel: 0 },
      { name: "The Glenlivet 18 Y.O.", description: "Single malt, 30ml pour.", price: "₹999", isVeg: true, spicyLevel: 0 },
      { name: "The Glenlivet 15 Y.O.", description: "Single malt, 30ml pour.", price: "₹699", isVeg: true, spicyLevel: 0 },
      { name: "The Glenlivet 12 Y.O.", description: "Single malt, 30ml pour.", price: "₹599", isVeg: true, spicyLevel: 0 },
      { name: "Laphroaig 10 Y.O.", description: "Single malt, 30ml pour.", price: "₹699", isVeg: true, spicyLevel: 0 },
      { name: "Glenfiddich 15 Y.O.", description: "Single malt, 30ml pour.", price: "₹699", isVeg: true, spicyLevel: 0 },
      { name: "Aberlour 12 Y.O.", description: "Single malt, 30ml pour.", price: "₹699", isVeg: true, spicyLevel: 0 },
      { name: "Longitude 77 Lagavulin", description: "Single malt, 30ml pour.", price: "₹599", isVeg: true, spicyLevel: 0 },
      { name: "Glenmorangie 10 Y.O.", description: "Single malt, 30ml pour.", price: "₹599", isVeg: true, spicyLevel: 0 },
      { name: "Macallan 12 Y.O. Old Dbl Cask", description: "Single malt, 30ml pour.", price: "₹1099", isVeg: true, spicyLevel: 0 },
      { name: "Macallan 12 Y.O.", description: "Single malt, 30ml pour.", price: "₹1099", isVeg: true, spicyLevel: 0 },
      { name: "Macallan A Night On Earth", description: "Single malt, 30ml pour.", price: "₹1099", isVeg: true, spicyLevel: 0 },
      { name: "Macallan 15 Y.O.", description: "Single malt, 30ml pour.", price: "₹1999", isVeg: true, spicyLevel: 0 },
      { name: "Glenfiddich 12 Y.O.", description: "Single malt, 30ml pour.", price: "₹625", isVeg: true, spicyLevel: 0 },
      { name: "Talisker 10 Y.O.", description: "Single malt, 30ml pour.", price: "₹625", isVeg: true, spicyLevel: 0 },
      { name: "Jura 10 Y.O.", description: "Single malt, 30ml pour.", price: "₹625", isVeg: true, spicyLevel: 0 },
      { name: "Singleton 12 Y.O.", description: "Single malt, 30ml pour.", price: "₹625", isVeg: true, spicyLevel: 0 },
      { name: "Solan Gold Single Malt", description: "Single malt, 30ml pour.", price: "₹599", isVeg: true, spicyLevel: 0 },
      { name: "Rampur Double Cask", description: "Single malt, 30ml pour.", price: "₹1199", isVeg: true, spicyLevel: 0 },
    ],
  },
  {
    name: "Japanese Whisky",
    items: [
      { name: "Yamazaki / Hibiki", description: "Japanese whisky, 30ml pour.", price: "₹1199", isVeg: true, spicyLevel: 0 },
      { name: "Suntory", description: "Japanese whisky, 30ml pour.", price: "₹625", isVeg: true, spicyLevel: 0 },
    ],
  },
  {
    name: "Scotch / Whiskey",
    items: [
      { name: "Royal Salute 21 Y.O.", description: "Scotch whisky, 30ml pour.", price: "₹1499", isVeg: true, spicyLevel: 0 },
      { name: "JW Blue Label", description: "Scotch whisky, 30ml pour.", price: "₹1399", isVeg: true, spicyLevel: 0 },
      { name: "Chivas Regal 18 Y.O.", description: "Scotch whisky, 30ml pour.", price: "₹825", isVeg: true, spicyLevel: 0 },
      { name: "Chivas Regal XV", description: "Scotch whisky, 30ml pour.", price: "₹745", isVeg: true, spicyLevel: 0 },
      { name: "Chivas Regal 12 Y.O.", description: "Scotch whisky, 30ml pour.", price: "₹599", isVeg: true, spicyLevel: 0 },
      { name: "JW Gold Label", description: "Scotch whisky, 30ml pour.", price: "₹699", isVeg: true, spicyLevel: 0 },
      { name: "JW Double Black", description: "Scotch whisky, 30ml pour.", price: "₹699", isVeg: true, spicyLevel: 0 },
      { name: "Monkey Shoulder", description: "Blended malt whisky, 30ml pour.", price: "₹625", isVeg: true, spicyLevel: 0 },
      { name: "Ballantine's 12 Y.O.", description: "Scotch whisky, 30ml pour.", price: "₹599", isVeg: true, spicyLevel: 0 },
      { name: "Ballantine's 7 Y.O.", description: "Scotch whisky, 30ml pour.", price: "₹525", isVeg: true, spicyLevel: 0 },
      { name: "Ballantine's Finest", description: "Scotch whisky, 30ml pour.", price: "₹499", isVeg: true, spicyLevel: 0 },
      { name: "Jameson Irish", description: "Irish whiskey, 30ml pour.", price: "₹499", isVeg: true, spicyLevel: 0 },
    ],
  },
];

let sceneScrollProgress = 0;

const splitText = (text: string) => text.split("").map((character, index) => <span className="split-char" key={`${character}-${index}`}>{character === " " ? "\u00a0" : character}</span>);

const fallbackGallery = [
  { imageUrl: asset.interior, title: "The rooftop room", category: "ambience" },
  { imageUrl: asset.dish, title: "Tandoori prawns · mango salsa", category: "plates" },
  { imageUrl: asset.cocktail, title: "Agave after dark", category: "drinks" },
];

gsap.registerPlugin(ScrollTrigger);

function isOpenNow() {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  const now = hour * 60 + minute;
  return now >= 780 || now <= 120;
}

function EmberField() {
  const points = useMemo(() => {
    const positions = new Float32Array(170 * 3);
    for (let i = 0; i < 170; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return positions;
  }, []);
  const ref = useRef<Points>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.025 + state.pointer.x * 0.08 + sceneScrollProgress * Math.PI * 1.4;
    ref.current.rotation.x = state.pointer.y * 0.06 + sceneScrollProgress * Math.PI * 0.55;
    ref.current.position.y = Math.sin(sceneScrollProgress * Math.PI) * 0.35;
  });

  return (
    <points ref={ref} position={[0, 0, -1]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffbf00" size={0.035} transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}

function FloatingForms() {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y += 0.0015 + sceneScrollProgress * 0.003;
    group.current.rotation.x = state.pointer.y * 0.05 + sceneScrollProgress * 0.18;
    group.current.position.x = state.pointer.x * 0.18 + Math.sin(sceneScrollProgress * Math.PI * 2) * 0.65;
    group.current.position.z = Math.cos(sceneScrollProgress * Math.PI) * 0.3;
  });

  return (
    <group ref={group} position={[1.8, 0.1, -0.3]}>
      <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.65}>
        <mesh position={[1.4, 1.2, 0]} rotation={[0.4, 0.25, 0.15]} scale={1 + Math.sin(sceneScrollProgress * Math.PI) * 0.28}>
          <dodecahedronGeometry args={[0.72, 0]} />
          <MeshTransmissionMaterial backside thickness={0.32} roughness={0.08} transmission={0.96} ior={1.35} chromaticAberration={0.04} color="#d4af37" />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.9}>
        <mesh position={[-1.1, -0.8, 0.5]} rotation={[0.25, 0.6, 0.12]} scale={1 + sceneScrollProgress * 0.12}>
          <torusGeometry args={[0.62, 0.2, 24, 64]} />
          <meshPhysicalMaterial color="#8b0000" emissive="#360000" emissiveIntensity={0.25} roughness={0.23} metalness={0.35} clearcoat={0.8} />
        </mesh>
      </Float>
      <Float speed={0.9} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh position={[0.2, -1.3, 0]} rotation={[0.1, 0.2, 0]} scale={1 + Math.sin(sceneScrollProgress * Math.PI) * 0.5}>
          <icosahedronGeometry args={[0.42, 1]} />
          <meshPhysicalMaterial color="#ffbf00" emissive="#6d4300" emissiveIntensity={0.4} roughness={0.22} metalness={0.55} />
        </mesh>
      </Float>
    </group>
  );
}

function HeroCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 46 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.4} color="#d4af37" />
      <pointLight position={[3, 3, 2]} color="#ffbf00" intensity={6} distance={9} />
      <pointLight position={[-3, -2, 1]} color="#8b0000" intensity={4} distance={7} />
      <EmberField />
      <FloatingForms />
    </Canvas>
  );
}

function useMotion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ autoRaf: false, duration: reduced ? 0.01 : 1.15, smoothWheel: !reduced });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const context = gsap.context(() => {
      const entrance = gsap.timeline({ defaults: { ease: "power4.out" } });
      entrance.to(".preloader-progress", { scaleX: 1, duration: reduced ? 0.05 : 0.9 }).to(".preloader", { yPercent: -100, duration: reduced ? 0.05 : 0.9, ease: "power4.inOut" }).fromTo(".hero-status-enter", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.35 }, "-=0.45").fromTo(".hero h1 .split-char", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.022 }, "-=0.14").fromTo(".hero-subtitle, .hero-buttons", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 }, "-=0.28");

      gsap.utils.toArray<HTMLElement>(".split-reveal").forEach((element) => {
        gsap.fromTo(element.querySelectorAll(".split-char"), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: reduced ? 0.05 : 0.7, stagger: 0.025, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 82%", once: true } });
      });

      gsap.utils.toArray<HTMLElement>(".reveal:not(.hero-content)").forEach((element) => {
        gsap.fromTo(element, { opacity: 0, y: 40 }, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 84%", once: true },
        });
      });
      gsap.to(".hero-orbit", { yPercent: 34, rotate: 20, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 } });
      gsap.to(".hero-canvas", { yPercent: -10, scale: 1.12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.4 } });
      gsap.to(".hero-content", { scale: 0.97, yPercent: -4, opacity: 1, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".giant-wordmark", { xPercent: -18, skewX: -5, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.1 } });
      gsap.to(".hero h1", { yPercent: -3, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.15 } });
      ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", onUpdate: (self) => { sceneScrollProgress = self.progress; } });
      const galleryCards = gsap.utils.toArray<HTMLElement>(".gallery-card");
      ScrollTrigger.create({ trigger: ".gallery-strip", start: "top bottom", end: "bottom top", onUpdate: () => { const center = window.innerWidth / 2; galleryCards.forEach((card) => { const box = card.getBoundingClientRect(); const distance = Math.abs(box.left + box.width / 2 - center) / Math.max(window.innerWidth / 2, 1); gsap.set(card, { scale: 1.08 - Math.min(distance, 1) * 0.22, opacity: 1 - Math.min(distance, 1) * 0.35, rotate: (box.left + box.width / 2 - center) * -0.004 }); }); } });
    });

    return () => {
      cancelAnimationFrame(frame);
      context.revert();
      lenis.destroy();
    };
  }, []);
}

function ReservationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reservationMutation = trpc.reservations.create.useMutation();
  const checkoutMutation = trpc.payments.createCheckout.useMutation();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [form, setForm] = useState<ReservationPayload>({ customerName: "", phoneNumber: "", email: "", reservationDate: "", timeSlot: "20:00", guestCount: 2, specialRequests: "" });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const update = (key: keyof ReservationPayload, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload = { ...form, paymentMethod };
      const reservation = await reservationMutation.mutateAsync(payload);
      const checkout = await checkoutMutation.mutateAsync({ reservationId: reservation.id, paymentMethod, amount: 500, currency: "INR" });
      if (checkout.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl);
      } else {
        toast.success("Booking request received", { description: "Your reservation is saved. Payment gateway credentials are ready to connect." });
      }
      onClose();
    } catch (error) {
      toast.error("We could not save your booking", { description: error instanceof Error ? error.message : "Please try again or call 09211313486." });
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="reservation-drawer" data-lenis-prevent="true" role="dialog" aria-modal="true" aria-labelledby="reservation-title">
        <button className="drawer-close" type="button" onClick={onClose} aria-label="Close reservation form"><X size={20} /></button>
        <p className="kicker gold">RESERVATIONS · JALISCO NOIDA</p>
        <h2 id="reservation-title">Save your<br /><em>seat.</em></h2>
        <p className="drawer-copy">The rooftop is ready. Tell us when you’re coming and we’ll take care of the rest.</p>
        <form className="drawer-form" onSubmit={handleSubmit}>
          <label>Name<input value={form.customerName} onChange={(event) => update("customerName", event.target.value)} placeholder="Your name" required /></label>
          <label>Phone<input value={form.phoneNumber} onChange={(event) => update("phoneNumber", event.target.value)} placeholder="+91 98xxx xxxxx" required /></label>
          <label>Email<input value={form.email} onChange={(event) => update("email", event.target.value)} type="email" placeholder="you@email.com" required /></label>
          <div className="drawer-row"><label>Date<input value={form.reservationDate} onChange={(event) => update("reservationDate", event.target.value)} type="date" required /></label><label>Guests<select value={form.guestCount} onChange={(event) => update("guestCount", Number(event.target.value))}><option value={2}>2 guests</option><option value={3}>3 guests</option><option value={4}>4 guests</option><option value={5}>5 guests</option><option value={6}>6+ guests</option></select></label></div>
          <label>Time slot<select value={form.timeSlot} onChange={(event) => update("timeSlot", event.target.value)}><option value="19:00">7:00 PM</option><option value="20:00">8:00 PM</option><option value="21:00">9:00 PM</option><option value="22:00">10:00 PM</option></select></label>
          <label>Special requests<textarea value={form.specialRequests} onChange={(event) => update("specialRequests", event.target.value)} placeholder="Birthday, dietary notes, rooftop preference…" rows={3} /></label>
          <fieldset className="payment-block"><legend>Secure booking deposit · ₹500</legend><p>Choose your preferred payment method. The secure gateway can be connected later without changing this booking experience.</p><div className="payment-options">{([['upi', 'UPI', 'Fast Indian checkout'], ['card', 'Cards', 'Credit or debit cards'], ['international', 'International', 'Global card payments']] as const).map(([value, label, description]) => <label className={paymentMethod === value ? "payment-option active" : "payment-option"} key={value}><input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} /><span><strong>{label}</strong><small>{description}</small></span></label>)}</div></fieldset>
          <button className="gold-button full" type="submit" disabled={reservationMutation.isPending || checkoutMutation.isPending}>{reservationMutation.isPending || checkoutMutation.isPending ? <LoaderCircle className="spin" size={17} /> : <CalendarDays size={17} />} {reservationMutation.isPending || checkoutMutation.isPending ? "Preparing booking" : "Continue to secure payment"}</button>
        </form>
      </aside>
    </div>
  );
}

function StatusPill() {
  const open = isOpenNow();
  return <span className={`status-pill ${open ? "open" : "closed"}`}><span /> {open ? "Open now" : "Closed · opens 1 PM"}</span>;
}

export default function Home() {
  useMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const menuQuery = useQuery({ queryKey: ["menu"], queryFn: fetchMenu, retry: 1, staleTime: 1000 * 60 * 5 });
  const galleryQuery = useQuery({ queryKey: ["gallery"], queryFn: fetchGallery, retry: 1, staleTime: 1000 * 60 * 5 });
  const menu = menuQuery.data?.length ? menuQuery.data : fallbackMenu;
  const gallery = galleryQuery.data?.length ? galleryQuery.data : fallbackGallery;
  const activeItems = menu[activeCategory]?.items || fallbackMenu[0].items;

  return (
    <div className="luxury-site">
      <div className="preloader" aria-hidden="true"><div className="preloader-monogram">J</div><div className="preloader-progress"><span /></div><span className="preloader-label">Jalisco Brews &amp; Bites</span></div>
      <header className="luxury-header">
        <a className="luxury-brand" href="#top" aria-label="Jalisco Brews and Bites home"><img src={asset.mark} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /><span>Jalisco <small>Brews &amp; Bites</small></span></a>
        <nav className={mobileOpen ? "luxury-nav open" : "luxury-nav"} aria-label="Main navigation">
          <a href="#concept" onClick={() => setMobileOpen(false)}>{splitText("The concept")}</a>
          <a href="#menu" onClick={() => setMobileOpen(false)}>{splitText("Menu")}</a>
          <a href="#gallery" onClick={() => setMobileOpen(false)}>{splitText("Gallery")}</a>
          <a href="#visit" onClick={() => setMobileOpen(false)}>{splitText("Visit us")}</a>
        </nav>
        <div className="header-actions"><StatusPill /><button className="gold-button compact" type="button" onClick={() => setReservationOpen(true)} style={{ backgroundColor: "#df5030" }}>Reserve <ArrowRight size={14} /></button><button className="menu-toggle" type="button" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle navigation">{mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}</button></div>
      </header>

      <main id="top">
        <section className="hero hero-dark" aria-labelledby="hero-title">
          <div className="hero-canvas"><HeroCanvas /></div>
          <div className="giant-wordmark" aria-hidden="true">JALISCO</div>
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="hero-content"><p className="kicker gold hero-status-enter">ROOFTOP DINING · NOIDA</p><h1 id="hero-title"><span className="split-line">{splitText("Where authentic")}</span><span className="split-line accent-line">{splitText("Mexican zest")}</span><span className="split-line">{splitText("meets North")}</span><span className="split-line accent-line">{splitText("Indian comfort.")}</span></h1><p className="hero-subtitle">A high-altitude meeting of fire, spice, and good company. Built for long lunches, golden hour pours, and nights that find their own rhythm.</p><div className="hero-buttons"><button className="gold-button" type="button" onClick={() => setReservationOpen(true)}>Reserve a table <ArrowRight size={16} /></button><a className="text-button light" href="#menu">Explore the menu <ArrowDown size={16} /></a></div></div>
          <div className="hero-footer"><span>Sector 18 · Noida</span><span className="hero-scroll"><span /> Scroll to discover</span><span>12:00 — 23:45 IST</span></div>
        </section>

        <section className="statement-section" id="concept">
          <div className="statement-mark"><Sparkles size={17} /><span>J / B</span></div>
          <div className="statement-copy reveal"><p className="kicker gold">A NEW KIND OF ROOFTOP</p><h2 className="split-reveal"><span className="split-line">{splitText("Two cultures.")}</span><em className="split-line">{splitText("One table.")}</em></h2><p>Jalisco Brews &amp; Bites is a rooftop fusion bar where North Indian soul meets Mexican electricity. Familiar ingredients take the scenic route. The result is unexpected, generous, and made to be passed around.</p><a className="text-button gold-text" href="#gallery">Meet the atmosphere <ArrowRight size={15} /></a></div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading reveal"><div><p className="kicker gold">THE MENU</p><h2 className="split-reveal"><span className="split-line">{splitText("Comfort,")}</span><em className="split-line">{splitText("with a kick.")}</em></h2></div><p className="section-intro">A menu that travels well. Tandoor smoke, citrus brightness, and a little heat in all the right places.</p></div>
          <div className="menu-tabs" role="tablist">{menu.map((category, index) => <button className={activeCategory === index ? "menu-tab active" : "menu-tab"} key={category.name} type="button" role="tab" aria-selected={activeCategory === index} onClick={() => setActiveCategory(index)}>{category.name}</button>)}</div>
          {menuQuery.isLoading ? <div className="menu-loading"><LoaderCircle className="spin" /> Loading the good stuff…</div> : menuQuery.isError ? <div className="api-note">Showing the house menu while the API reconnects.</div> : null}
          <div className="dish-grid reveal" key={activeCategory}>{activeItems.map((item, index) => <article className="dish-card" key={item.name}><div className="dish-number">0{index + 1}</div><div className="dish-info"><div className="dish-topline"><span className="dish-type">{item.isVeg ? "VEG" : "FROM THE FIRE"}</span>{item.spicyLevel ? <span className="heat">{"✦".repeat(item.spicyLevel)}</span> : null}</div><h3>{item.name}</h3><p>{item.description}</p><span className="dish-price">{typeof item.price === "number" ? `₹${item.price}` : item.price}</span></div><div className="dish-arrow"><ArrowRight size={17} /></div></article>)}</div>
          <button className="outline-button" type="button" onClick={() => toast.info("Full menu PDF coming soon.")}>View the full menu <ArrowRight size={15} /></button>
        </section>

        <section className="gallery-section" id="gallery"><div className="gallery-header reveal"><p className="kicker gold">THE ROOFTOP</p><h2 className="split-reveal"><span className="split-line">{splitText("Come for the view.")}</span><em className="split-line">{splitText("Stay for the mood.")}</em></h2><div className="gallery-meta"><StatusPill /><a className="gallery-instagram" href="https://www.instagram.com/jalisco.brews/" target="_blank" rel="noreferrer" aria-label="Open Jalisco Brews and Bites on Instagram">@jalisco.brews <Instagram size={15} /></a></div></div><div className="gallery-strip">{gallery.map((image, index) => <figure className={`gallery-card gallery-${index + 1}`} key={`${image.imageUrl}-${index}`}><img src={image.imageUrl} alt={image.title || "Jalisco rooftop dining"} /><figcaption><span>0{index + 1}</span>{image.title || "Jalisco after dark"}</figcaption></figure>)}</div>{galleryQuery.isLoading ? <div className="gallery-loading"><LoaderCircle className="spin" /> Loading the atmosphere…</div> : null}</section>

        <section className="quote-section"><div className="quote-star">✦</div><blockquote className="split-reveal"><span className="split-line">{splitText("“Make tonight")}</span><em className="split-line">{splitText("the good kind of loud.”")}</em></blockquote><div className="quote-byline"><span /> The Jalisco table · Noida</div></section>

        <section className="payment-band" aria-labelledby="payment-title"><div><p className="kicker gold">BOOK WITH CONFIDENCE</p><h2 id="payment-title">Your table,<br /><em>one secure step away.</em></h2><p>Reserve your evening with a ₹500 deposit. UPI, cards, and international card payments are ready to connect through a secure gateway.</p></div><div className="payment-band-side"><div className="payment-method-row"><span>UPI</span><span>Cards</span><span>International</span></div><button className="gold-button" type="button" onClick={() => setReservationOpen(true)}>Book &amp; pay deposit <ArrowRight size={16} /></button><small>Secure checkout · gateway-ready</small></div></section>

        <section className="visit-section" id="visit"><div className="visit-copy reveal"><p className="kicker gold">FIND YOUR WAY HERE</p><h2 className="split-reveal"><span className="split-line">{splitText("The rooftop")}</span><em className="split-line">{splitText("is calling.")}</em></h2><div className="visit-details"><div><MapPin size={17} /><span>Unit No. 05, 3rd Floor<br /><small>Building Urbtech NPX, Sector 153, Greater Noida, Noida, Uttar Pradesh 201304</small></span></div><div><Clock3 size={17} /><span>Open now · Every day<br /><small>1:00 PM — 2:00 AM IST</small></span></div><div><Phone size={17} /><span>Reservations<br /><small>09211313486</small></span></div></div><a className="gold-button" href="tel:+919211313486">Call to reserve <Phone size={16} /></a></div><div className="visit-map"><div className="map-glow" /><div className="map-lines" /><div className="map-label"><span>JALISCO BREWS &amp; BITES</span><strong>Urbtech NPX</strong><small>Sector 153 · Noida</small></div><div className="map-pin"><MapPin size={18} /></div><a href="https://maps.google.com/?q=Jalisco+Brews+%26+Bites+Urbtech+NPX+Sector+153+Noida+Uttar+Pradesh+201304" target="_blank" rel="noreferrer">Open in maps <ArrowRight size={14} /></a></div></section>
      </main>

      <footer className="luxury-footer"><div className="footer-brand"><img src={asset.mark} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /><span>Jalisco <small>Brews &amp; Bites</small></span></div><p>Authentic zest. North Indian comfort.<br />Made for the rooftop.</p><div className="footer-links"><a href="https://www.instagram.com/jalisco.brews/" target="_blank" rel="noreferrer"><Instagram size={15} /> @jalisco.brews</a><a href="tel:+919211313486"><Phone size={15} /> 09211313486</a></div></footer>
      <ReservationModal open={reservationOpen} onClose={() => setReservationOpen(false)} />
    </div>
  );
}

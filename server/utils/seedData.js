
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose  = require('mongoose')
const connectDB = require('../config/db')

const User            = require('../models/User')
const ServiceProvider = require('../models/ServiceProvider')
const Service         = require('../models/Service')
const Booking         = require('../models/Booking')
const Review          = require('../models/Review')


const COORDS = {
  // Vidisha city areas (all within city boundary ~23.52°N, 77.80°E)
  civilLines:          { lat: 23.5300, lng: 77.8150 },   // Admin/govt area, north of station
  ganjBazar:           { lat: 23.5240, lng: 77.8090 },   // Old market, centre of city
  railwayColonyVid:    { lat: 23.5190, lng: 77.8060 },   // Near Vidisha Railway Station
  sanchiRoad:          { lat: 23.5160, lng: 77.7980 },   // Towards Sanchi (west side)
  bhilapura:           { lat: 23.5270, lng: 77.8200 },   // East residential area
  naksheliMohalla:     { lat: 23.5260, lng: 77.8120 },   // Old town mohalla
  bhopalRoad:          { lat: 23.5100, lng: 77.8010 },   // South, towards Bhopal NH
  satpura:             { lat: 23.5350, lng: 77.8100 },   // North residential
  uddayagiriRoad:      { lat: 23.5220, lng: 77.7900 },   // Udaygiri caves side
  heliodorusPillarRd:  { lat: 23.5400, lng: 77.8170 },   // Besnagar / pillar area
  industrialArea:      { lat: 23.5080, lng: 77.8230 },   // SITI industrial zone
  newColony:           { lat: 23.5320, lng: 77.8250 },   // New residential colony
  // Towns in Vidisha district
  ganjbasoda:          { lat: 23.8651, lng: 77.9412 },   // Tehsil town, 38km north
  gyaraspur:           { lat: 23.7622, lng: 77.9452 },   // Historical town, 28km north
  sironj:              { lat: 24.0476, lng: 77.6905 },   // North-west tehsil, 60km
  kurwai:              { lat: 23.7860, lng: 77.9900 },   // East, 32km
  shamshabad:          { lat: 23.4592, lng: 77.9512 },   // South-east, 19km
  sanchi:              { lat: 23.4791, lng: 77.7390 },   // UNESCO site, 9km west
}

const CUSTOMERS = [
  {
    name: 'Rajesh Kumar Mishra',
    email: 'rajesh.mishra@test.com',
    password: 'test1234',
    role: 'user',
    phone: '9826411201',
    address: { street: 'Civil Lines, Near Collector Office', city: 'Vidisha', state: 'Madhya Pradesh', pincode: '464001' },
    location: { type: 'Point', coordinates: [COORDS.civilLines.lng, COORDS.civilLines.lat] },
  },
  {
    name: 'Sunita Yadav',
    email: 'sunita.yadav@test.com',
    password: 'test1234',
    role: 'user',
    phone: '9826411202',
    address: { street: 'Ganj Bazar, Near Hanuman Mandir', city: 'Vidisha', state: 'Madhya Pradesh', pincode: '464001' },
    location: { type: 'Point', coordinates: [COORDS.ganjBazar.lng, COORDS.ganjBazar.lat] },
  },
  {
    name: 'Mahesh Prasad Verma',
    email: 'mahesh.verma@test.com',
    password: 'test1234',
    role: 'user',
    phone: '9826411203',
    address: { street: 'Sanchi Road, Opp. S.M. Dyechem', city: 'Vidisha', state: 'Madhya Pradesh', pincode: '464001' },
    location: { type: 'Point', coordinates: [COORDS.sanchiRoad.lng, COORDS.sanchiRoad.lat] },
  },
  {
    name: 'Priya Tiwari',
    email: 'priya.tiwari@test.com',
    password: 'test1234',
    role: 'user',
    phone: '9826411204',
    address: { street: 'Besnagar, Heliodorus Pillar Road', city: 'Vidisha', state: 'Madhya Pradesh', pincode: '464001' },
    location: { type: 'Point', coordinates: [COORDS.heliodorusPillarRd.lng, COORDS.heliodorusPillarRd.lat] },
  },
  {
    name: 'Amit Kumar Sharma',
    email: 'amit.sharma@test.com',
    password: 'test1234',
    role: 'user',
    phone: '9826411205',
    address: { street: 'New Colony, Near SATI College', city: 'Vidisha', state: 'Madhya Pradesh', pincode: '464001' },
    location: { type: 'Point', coordinates: [COORDS.newColony.lng, COORDS.newColony.lat] },
  },
  {
    name: 'Kavita Devi Patel',
    email: 'kavita.patel@test.com',
    password: 'test1234',
    role: 'user',
    phone: '9826411206',
    address: { street: 'Railway Colony, Near Station', city: 'Ganjbasoda', state: 'Madhya Pradesh', pincode: '464221' },
    location: { type: 'Point', coordinates: [COORDS.ganjbasoda.lng, COORDS.ganjbasoda.lat] },
  },
  {
    name: 'Deepak Jain',
    email: 'deepak.jain@test.com',
    password: 'test1234',
    role: 'user',
    phone: '9826411207',
    address: { street: 'Bhopal Road, Near Bus Stand', city: 'Vidisha', state: 'Madhya Pradesh', pincode: '464001' },
    location: { type: 'Point', coordinates: [COORDS.bhopalRoad.lng, COORDS.bhopalRoad.lat] },
  },
  {
    name: 'Anita Rani Gupta',
    email: 'anita.gupta@test.com',
    password: 'test1234',
    role: 'user',
    phone: '9826411208',
    address: { street: 'Satpura Colony, Ward No. 12', city: 'Vidisha', state: 'Madhya Pradesh', pincode: '464001' },
    location: { type: 'Point', coordinates: [COORDS.satpura.lng, COORDS.satpura.lat] },
  },
]

//  PROVIDERS 

const PROVIDERS = [

  // ── PLUMBING ────────────────────────────────────────────────────────────────
  {
    name: 'Ramsevak Vishwakarma',
    email: 'ramsevak.plumber@test.com',
    password: 'test1234',
    phone: '9826501101',
    businessName: 'Vishwakarma Plumbing Works',
    category: 'plumbing',
    bio: 'Nagar Nigam registered plumber serving Vidisha city for 12 years. Expert in domestic pipe repairs, overhead tank fitting, bathroom renovation plumbing, and borewell connections. Workshop near Ganj Bazar, Vidisha. Emergency call accepted 6 AM–10 PM.',
    experience: 12,
    isVerified: true,
    serviceRadius: 15,
    city: 'Vidisha',
    area: 'Ganj Bazar, Near Hanuman Chowk',
    pincode: '464001',
    coords: COORDS.ganjBazar,
    rating: { average: 4.8, count: 134 },
    completedJobs: 312,
    totalEarnings: 187200,
  },
  {
    name: 'Shivprasad Nishad',
    email: 'shivprasad.plumber@test.com',
    password: 'test1234',
    phone: '9826501102',
    businessName: 'Shiv Shankar Plumbing & Sanitation',
    category: 'plumbing',
    bio: 'Based in Ganjbasoda, serving the Betwa River valley belt. Specialises in submersible pump installation, borewell pipe assembly, and agricultural water connections. Also covers Nateran and Kurwai tehsils.',
    experience: 8,
    isVerified: true,
    serviceRadius: 25,
    city: 'Ganjbasoda',
    area: 'Station Road, Ganjbasoda',
    pincode: '464221',
    coords: COORDS.ganjbasoda,
    rating: { average: 4.6, count: 87 },
    completedJobs: 203,
    totalEarnings: 121800,
  },

  // ── ELECTRICAL ──────────────────────────────────────────────────────────────
  {
    name: 'Mukesh Patel Electrician',
    email: 'mukesh.electric@test.com',
    password: 'test1234',
    phone: '9826501103',
    businessName: 'Patel Electrical Services Vidisha',
    category: 'electrical',
    bio: 'ITI-certified licensed electrician (MP Urja Vibhag reg. no. VDS-EL-2014-0338) serving Vidisha and Sanchi road corridor since 2014. Handles complete home wiring, solar panel installation (MPCZ approved), inverter/UPS fitting, and industrial switchgear. 24×7 emergency response.',
    experience: 10,
    isVerified: true,
    serviceRadius: 20,
    city: 'Vidisha',
    area: 'Bhopal Road, Near RTO Office',
    pincode: '464001',
    coords: COORDS.bhopalRoad,
    rating: { average: 4.9, count: 201 },
    completedJobs: 445,
    totalEarnings: 356000,
  },
  {
    name: 'Dharmendra Singh Rawat',
    email: 'dharmendra.electric@test.com',
    password: 'test1234',
    phone: '9826501104',
    businessName: 'Rawat Bijli Seva Kendra',
    category: 'electrical',
    bio: 'Rural electrician serving Gyaraspur, Lateri, and surrounding villages since 2017. Specialises in agricultural pump motor winding, transformer connections, and 3-phase line repairs. Also handles household work in Gyaraspur town.',
    experience: 7,
    isVerified: false,
    serviceRadius: 30,
    city: 'Gyaraspur',
    area: 'Main Bazar, Gyaraspur',
    pincode: '464331',
    coords: COORDS.gyaraspur,
    rating: { average: 4.4, count: 63 },
    completedJobs: 178,
    totalEarnings: 142400,
  },

  // ── CLEANING ────────────────────────────────────────────────────────────────
  {
    name: 'Savitribai Ahirwar',
    email: 'savitri.clean@test.com',
    password: 'test1234',
    phone: '9826501105',
    businessName: 'Savitri Home Cleaning Services',
    category: 'cleaning',
    bio: 'Women-led professional cleaning team of 5 trained women, serving Vidisha city since 2019. Deep home cleaning, office sanitation, post-construction cleanup, and special festive season packages (Diwali/Holi). Eco-friendly products. Nagar Palika empanelled vendor.',
    experience: 5,
    isVerified: true,
    serviceRadius: 12,
    city: 'Vidisha',
    area: 'Naksheli Mohalla, Near Jama Masjid',
    pincode: '464001',
    coords: COORDS.naksheliMohalla,
    rating: { average: 4.7, count: 156 },
    completedJobs: 289,
    totalEarnings: 375700,
  },

  // ── AC REPAIR ───────────────────────────────────────────────────────────────
  {
    name: 'Rajkumar Sahu',
    email: 'rajkumar.ac@test.com',
    password: 'test1234',
    phone: '9826501106',
    businessName: 'Sahu AC & Refrigeration Works',
    category: 'ac',
    bio: 'Authorised service partner for Voltas, LG, and Daikin in Vidisha district since 2015. Expert in split/window AC gas refilling, PCB repair, compressor replacement, and annual maintenance contracts. Workshop near Bus Stand, Vidisha. Covers entire Vidisha district.',
    experience: 9,
    isVerified: true,
    serviceRadius: 35,
    city: 'Vidisha',
    area: 'Bus Stand Road, Near ISBT',
    pincode: '464001',
    coords: COORDS.ganjBazar,
    rating: { average: 4.8, count: 224 },
    completedJobs: 521,
    totalEarnings: 364700,
  },

  // ── CARPENTRY ───────────────────────────────────────────────────────────────
  {
    name: 'Ramkishan Mistri Badhai',
    email: 'ramkishan.carpenter@test.com',
    password: 'test1234',
    phone: '9826501107',
    businessName: 'Ramkishan Furniture & Carpentry Works',
    category: 'carpentry',
    bio: 'Third-generation skilled carpenter from Sironj. Crafts custom Sagwan (Teak) and Sheesham furniture — beds, wardrobes, dining tables, and modular kitchens. Registered with Sironj Nagar Parishad. Delivers to Vidisha, Ganjbasoda, and Bhopal.',
    experience: 15,
    isVerified: true,
    serviceRadius: 50,
    city: 'Sironj',
    area: 'Tehsil Road, Near Sironj Court',
    pincode: '464228',
    coords: COORDS.sironj,
    rating: { average: 4.7, count: 98 },
    completedJobs: 267,
    totalEarnings: 668000,
  },

  // ── PAINTING ────────────────────────────────────────────────────────────────
  {
    name: 'Jagdish Prasad Rangrez',
    email: 'jagdish.painter@test.com',
    password: 'test1234',
    phone: '9826501108',
    businessName: 'Jagdish Colour House Vidisha',
    category: 'painting',
    bio: 'Authorised dealer of Asian Paints and Berger Paints in Vidisha. Provides interior/exterior painting, wall putty, POP ceiling work, texture painting, and waterproofing. Workshop at Bhilapura, Vidisha. Team of 6 trained painters available.',
    experience: 11,
    isVerified: true,
    serviceRadius: 20,
    city: 'Vidisha',
    area: 'Bhilapura, Near Civil Hospital',
    pincode: '464001',
    coords: COORDS.bhilapura,
    rating: { average: 4.6, count: 112 },
    completedJobs: 198,
    totalEarnings: 495000,
  },

  // ── GARDENING ───────────────────────────────────────────────────────────────
  {
    name: 'Balram Singh Mali',
    email: 'balram.garden@test.com',
    password: 'test1234',
    phone: '9826501109',
    businessName: 'Balram Bagwani Seva Vidisha',
    category: 'gardening',
    bio: 'Retired MP Horticulture Department employee with 14 years government experience, now offering private garden services in Vidisha. Lawn design, ornamental plants, kitchen garden setup, seasonal flowers, and vermicompost supply. Nursery near Udaygiri Road.',
    experience: 14,
    isVerified: false,
    serviceRadius: 15,
    city: 'Vidisha',
    area: 'Udaygiri Road, Near Betwa River',
    pincode: '464001',
    coords: COORDS.uddayagiriRoad,
    rating: { average: 4.5, count: 72 },
    completedJobs: 134,
    totalEarnings: 134000,
  },

  // ── PEST CONTROL ────────────────────────────────────────────────────────────
  {
    name: 'Suresh Kumar Keetnashak',
    email: 'suresh.pest@test.com',
    password: 'test1234',
    phone: '9826501110',
    businessName: 'Keetatantra Pest Control Vidisha',
    category: 'pest',
    bio: 'MP Government licensed pest control operator (Lic. No. VDS-PCO-2019-047). Handles residential/commercial pest control, anti-termite treatment (pre & post-construction), grain storage (mandi) fumigation, and mosquito fogging. 3-month service warranty on all treatments.',
    experience: 6,
    isVerified: true,
    serviceRadius: 40,
    city: 'Vidisha',
    area: 'Satpura Colony, Ward 12',
    pincode: '464001',
    coords: COORDS.satpura,
    rating: { average: 4.7, count: 143 },
    completedJobs: 310,
    totalEarnings: 263500,
  },

  // ── PAINTING (2nd, Shamshabad area) ────────────────────────────────────────
  {
    name: 'Mohan Lal Painter',
    email: 'mohan.painter@test.com',
    password: 'test1234',
    phone: '9826501111',
    businessName: 'Mohan Painting Contractor Shamshabad',
    category: 'painting',
    bio: 'Serving Shamshabad tehsil and nearby villages for 8 years. Experienced in lime wash, distemper, emulsion painting for government buildings, schools, and homes. Affordable rates for rural areas. Also covers Lateri and Pipalkheda.',
    experience: 8,
    isVerified: false,
    serviceRadius: 30,
    city: 'Shamshabad',
    area: 'Main Market, Shamshabad',
    pincode: '464111',
    coords: COORDS.shamshabad,
    rating: { average: 4.3, count: 41 },
    completedJobs: 112,
    totalEarnings: 280000,
  },

  // ── CLEANING (2nd, Kurwai) ──────────────────────────────────────────────────
  {
    name: 'Reena Bai Sahu',
    email: 'reena.clean@test.com',
    password: 'test1234',
    phone: '9826501112',
    businessName: 'Reena Swachh Seva Kurwai',
    category: 'cleaning',
    bio: 'Self-help group (SHG) based cleaning team serving Kurwai and nearby areas. 4 trained women cleaners. Offers home cleaning, school sanitation, and hospital room cleaning contracts. Supported under Beti Bachao Beti Padhao scheme.',
    experience: 3,
    isVerified: false,
    serviceRadius: 20,
    city: 'Kurwai',
    area: 'Gandhi Chowk, Kurwai',
    pincode: '464224',
    coords: COORDS.kurwai,
    rating: { average: 4.2, count: 28 },
    completedJobs: 67,
    totalEarnings: 87100,
  },
]


//  SERVICES 

const SERVICES = [

  // ── Vishwakarma Plumbing (Vidisha city) ────────────────────────────────────
  {
    providerEmail: 'ramsevak.plumber@test.com',
    title: 'Full Home Plumbing Inspection & Repair',
    category: 'plumbing',
    price: 499,
    priceType: 'fixed',
    duration: '2-4 hrs',
    description: 'Complete plumbing health check for your Vidisha home. Covers water line inspection, hidden leak detection with pressure test, corroded tap replacement, pipe joint sealing, and overflow tank valve check. Minor fittings (washers, nuts, bolts) included in price. Serving Civil Lines, Ganj Bazar, Bhilapura, Naksheli Mohalla, and nearby wards.',
    tags: 'leak detection,pipe repair,tap,pressure test,Vidisha,emergency',
    isPopular: true,
  },
  {
    providerEmail: 'ramsevak.plumber@test.com',
    title: 'Overhead Tank Cleaning & Pipe Fitting',
    category: 'plumbing',
    price: 349,
    priceType: 'fixed',
    duration: '2-3 hrs',
    description: 'Complete rooftop water tank cleaning (up to 1000 litres) with scrubbing, chlorine disinfection, and silt removal. Includes inlet/outlet pipe inspection and float valve check. Ensures safe, clean drinking water. Vidisha city and SATI campus area covered.',
    tags: 'tank cleaning,water tank,disinfection,drinking water,Vidisha',
    isPopular: false,
  },
  {
    providerEmail: 'ramsevak.plumber@test.com',
    title: 'Bathroom Fitting & Geyser Connection',
    category: 'plumbing',
    price: 299,
    priceType: 'starting_from',
    duration: '1-2 hrs',
    description: 'Installation or repair of bathroom fittings — showers, taps, flush tanks, wash basins, and geyser water connections. Unblocking of floor traps and drainage pipes. Genuine Jaquar, Cera, or Hindware fittings available on request at extra cost.',
    tags: 'bathroom,geyser,tap,shower,flush tank,drain,Vidisha',
    isPopular: false,
  },
  {
    providerEmail: 'ramsevak.plumber@test.com',
    title: 'New Bathroom Complete Plumbing Work',
    category: 'plumbing',
    price: 1999,
    priceType: 'starting_from',
    duration: '1 day',
    description: 'End-to-end plumbing for a newly constructed bathroom: water supply lines, drainage slope, toilet seat fixing, wash basin connection, geyser pipeline, and floor trap. Labour + basic fittings included. Rate varies with toilet type. For Vidisha city and surroundings.',
    tags: 'new bathroom,complete plumbing,construction,toilet,Vidisha',
    isPopular: false,
  },

  // ── Shiv Shankar Plumbing (Ganjbasoda) ────────────────────────────────────
  {
    providerEmail: 'shivprasad.plumber@test.com',
    title: 'Submersible Pump & Borewell Installation',
    category: 'plumbing',
    price: 1499,
    priceType: 'starting_from',
    duration: '4-6 hrs',
    description: 'Complete borewell pipe assembly, submersible motor installation (Kirloskar/CRI/Grundfos), pressure tank fitting, and starter panel wiring. Serving Ganjbasoda, Kurwai, Nateran, and Gyaraspur. Workmanship guarantee provided. Agricultural and domestic connections handled.',
    tags: 'borewell,submersible pump,Kirloskar,Ganjbasoda,water pump',
    isPopular: true,
  },
  {
    providerEmail: 'shivprasad.plumber@test.com',
    title: 'Emergency Pipe Burst Repair',
    category: 'plumbing',
    price: 399,
    priceType: 'starting_from',
    duration: '1-2 hrs',
    description: 'Emergency same-day repair for burst pipes, sudden water line damage, and major leaks. Response within 90 minutes across Ganjbasoda town and nearby villages. Labour and basic GI/CPVC fittings included in base price. Call anytime 6 AM–10 PM.',
    tags: 'emergency,burst pipe,same day,leak,Ganjbasoda,urgent',
    isPopular: false,
  },

  // ── Patel Electrical (Vidisha) ─────────────────────────────────────────────
  {
    providerEmail: 'mukesh.electric@test.com',
    title: 'Complete Home Electrical Wiring (New / Rewiring)',
    category: 'electrical',
    price: 2999,
    priceType: 'starting_from',
    duration: '1-2 days',
    description: 'Full house wiring using ISI-marked Finolex copper wire, MCB board installation (Legrand/Havells), proper earthing, and load balancing. Covers up to 2BHK flat or 1500 sq ft house. Includes 1-year workmanship warranty. MP Urja Vibhag compliant. Serving Vidisha city, Sanchi road, and Bhopal road area.',
    tags: 'home wiring,MCB,earthing,copper wire,new construction,Vidisha,licensed',
    isPopular: true,
  },
  {
    providerEmail: 'mukesh.electric@test.com',
    title: 'Rooftop Solar Panel Installation',
    category: 'electrical',
    price: 8999,
    priceType: 'starting_from',
    duration: '2-3 days',
    description: 'Grid-tied or off-grid rooftop solar installation for homes and small shops. Includes GI mounting structure, MPCZ-approved on-grid inverter, DC wiring, and net metering application assistance. Subsidy under PM Surya Ghar Yojana available. Covering all of Vidisha district.',
    tags: 'solar,rooftop solar,PM Surya Ghar,MPCZ,net metering,Vidisha,green energy',
    isPopular: false,
  },
  {
    providerEmail: 'mukesh.electric@test.com',
    title: 'Ceiling Fan, LED Light & Switch Installation',
    category: 'electrical',
    price: 199,
    priceType: 'starting_from',
    duration: '1-2 hrs',
    description: 'Quick installation of ceiling fans (all brands), LED bulbs/panels, tube lights, wall switches, and plug points. Wiring repair for loose connections. Same-day service available across Vidisha city. Bring your fixture or we supply at market price.',
    tags: 'fan,LED,switch,light fitting,installation,same day,Vidisha',
    isPopular: true,
  },
  {
    providerEmail: 'mukesh.electric@test.com',
    title: 'Inverter & Battery Installation / Repair',
    category: 'electrical',
    price: 499,
    priceType: 'starting_from',
    duration: '2-3 hrs',
    description: 'Home UPS/inverter installation (Luminous, Microtek, Su-Kam, Exide), battery replacement, wiring check, and load calculation. Troubleshooting for inverter not charging or not giving backup. Distilled water top-up for tubular batteries included. Covering Vidisha city.',
    tags: 'inverter,UPS,battery,Luminous,Microtek,power backup,Vidisha',
    isPopular: false,
  },

  // ── Rawat Bijli Seva (Gyaraspur) ──────────────────────────────────────────
  {
    providerEmail: 'dharmendra.electric@test.com',
    title: 'Agricultural Pump Motor Winding & Repair',
    category: 'electrical',
    price: 699,
    priceType: 'starting_from',
    duration: '3-5 hrs',
    description: 'Motor winding repair, starter panel installation, and field wiring for agricultural water pumps (1HP to 10HP). Covers Gyaraspur, Lateri, Nateran, and surrounding villages. Experience with 3-phase MPWZ Vidisha electricity connections. Affordable rates for farmers.',
    tags: 'motor winding,farm pump,agriculture,3-phase,Gyaraspur,Lateri,farmer',
    isPopular: false,
  },
  {
    providerEmail: 'dharmendra.electric@test.com',
    title: 'Home Wiring & Repair – Gyaraspur & Villages',
    category: 'electrical',
    price: 299,
    priceType: 'starting_from',
    duration: '2-4 hrs',
    description: 'Domestic electrical repair and wiring for homes in Gyaraspur town and nearby villages. Handles short circuits, loose wiring, new points, meter board repair, and fan/light fitting. Serving Gyaraspur, Kurwai, Pathari, and Lateri areas at rural-friendly prices.',
    tags: 'home wiring,rural,Gyaraspur,Kurwai,Pathari,village,repair',
    isPopular: false,
  },

  // ── Savitri Cleaning (Vidisha city) ───────────────────────────────────────
  {
    providerEmail: 'savitri.clean@test.com',
    title: 'Full Home Deep Cleaning (2–4 BHK)',
    category: 'cleaning',
    price: 1199,
    priceType: 'starting_from',
    duration: '4-7 hrs',
    description: 'Comprehensive home deep cleaning by trained women team. Covers all rooms (dry dust + wet mop), kitchen (stove, chimney, tiles, inside cabinets), bathrooms (tiles, commode, mirror), ceiling fans, windows, and disinfectant mopping. Eco-friendly, child-safe products used. Serving Vidisha city: Civil Lines, Ganj Bazar, Bhilapura, Naksheli Mohalla, New Colony, Satpura Colony.',
    tags: 'deep cleaning,home,kitchen,bathroom,Vidisha,women team,eco friendly',
    isPopular: true,
  },
  {
    providerEmail: 'savitri.clean@test.com',
    title: 'Diwali / Festival Special Cleaning Package',
    category: 'cleaning',
    price: 999,
    priceType: 'fixed',
    duration: '3-5 hrs',
    description: 'Special pre-festival cleaning package popular in Vidisha before Diwali, Holi, and Navratri. Includes full home cleaning, window glass cleaning, cobweb removal from all corners, fan and AC vent cleaning, and final mopping with phenyl. Book 7+ days in advance for festival slots.',
    tags: 'Diwali cleaning,festival,Vidisha,pre festival,home,special package',
    isPopular: true,
  },
  {
    providerEmail: 'savitri.clean@test.com',
    title: 'Office & Clinic Cleaning Contract',
    category: 'cleaning',
    price: 599,
    priceType: 'starting_from',
    duration: '2-3 hrs',
    description: 'Professional cleaning for offices, shops, clinics, and showrooms in Vidisha city. Daily / weekly / monthly contracts available. Covers dusting, floor sweeping and mopping, washroom sanitisation, and waste disposal. Special packages for government offices in Civil Lines area.',
    tags: 'office cleaning,commercial,clinic,Vidisha,contract,Civil Lines',
    isPopular: false,
  },
  {
    providerEmail: 'savitri.clean@test.com',
    title: 'Post-Construction / Move-In Cleaning',
    category: 'cleaning',
    price: 1799,
    priceType: 'starting_from',
    duration: '6-10 hrs',
    description: 'Heavy-duty cleaning after construction or renovation of your Vidisha home. Removes cement dust, paint splatter, tile adhesive residue, and construction debris. Includes window frame cleaning, floor scrubbing with acid wash (if needed), and final sanitisation. Book for newly completed homes in SATI area, New Colony, or any ward.',
    tags: 'post construction,new house,move in,renovation,cement,Vidisha',
    isPopular: false,
  },

  // ── Sahu AC (Vidisha city) ─────────────────────────────────────────────────
  {
    providerEmail: 'rajkumar.ac@test.com',
    title: 'AC Annual Maintenance Contract (1 Unit)',
    category: 'ac',
    price: 1499,
    priceType: 'fixed',
    duration: 'Year-round (2 visits)',
    description: 'Annual AMC for 1 split or window AC unit. Includes 2 scheduled services (April before summer + July before monsoon), complete coil wash, filter cleaning, gas pressure check, PCB inspection, and 1 free breakdown visit. Authorised for Voltas, LG, Daikin, Blue Star, Hitachi. Covering all of Vidisha district.',
    tags: 'AMC,annual maintenance,AC service,Vidisha,Voltas,LG,Daikin,Hitachi',
    isPopular: true,
  },
  {
    providerEmail: 'rajkumar.ac@test.com',
    title: 'AC Gas Refilling & Performance Check',
    category: 'ac',
    price: 799,
    priceType: 'starting_from',
    duration: '1-2 hrs',
    description: 'R-22 / R-32 / R-410A gas top-up with electronic leak detection. Includes condenser and evaporator coil cleaning, fan motor lubrication, and cooling performance test. Works on all brands. Useful before Vidisha summer (April–June) when temperatures cross 44°C. Doorstep service across district.',
    tags: 'gas refill,R22,R32,AC cooling,leak detection,all brands,Vidisha summer',
    isPopular: true,
  },
  {
    providerEmail: 'rajkumar.ac@test.com',
    title: 'New Split AC Installation',
    category: 'ac',
    price: 999,
    priceType: 'fixed',
    duration: '2-3 hrs',
    description: 'Professional installation of new 1–2 ton split ACs. Includes indoor unit wall mounting with drill, outdoor unit installation (up to 1st floor), copper pipe fitting (up to 10 ft), electrical connection, and gas charging test. Covering Vidisha, Ganjbasoda, and Sanchi road belt.',
    tags: 'AC installation,split AC,new AC,wall mounting,Vidisha,Ganjbasoda',
    isPopular: false,
  },
  {
    providerEmail: 'rajkumar.ac@test.com',
    title: 'Refrigerator & Washing Machine Repair',
    category: 'ac',
    price: 399,
    priceType: 'starting_from',
    duration: '1-3 hrs',
    description: 'Doorstep repair for all types of refrigerators (single/double door, frost-free), washing machines (semi/fully automatic), and water coolers. PCB repair, thermostat replacement, compressor service, drum belt replacement, and door gasket fitting. Genuine spare parts available. Vidisha city same-day service.',
    tags: 'refrigerator,washing machine,fridge repair,home appliance,Vidisha',
    isPopular: false,
  },

  // ── Ramkishan Carpentry (Sironj) ──────────────────────────────────────────
  {
    providerEmail: 'ramkishan.carpenter@test.com',
    title: 'Custom Teak / Sheesham Furniture Making',
    category: 'carpentry',
    price: 3999,
    priceType: 'starting_from',
    duration: '3-7 days',
    description: 'Handcrafted custom furniture from seasoned Sagwan (Teak) or Sheesham wood — double beds, wardrobes, dining sets, sofa frames, study tables, and storage units. Finish options: enamel paint, PU polish, or melamine. Free home measurement visit within Sironj and Vidisha. Third-generation craftsmen.',
    tags: 'furniture,teak,sheesham,custom,wardrobe,bed,Sironj,Vidisha,handcrafted',
    isPopular: true,
  },
  {
    providerEmail: 'ramkishan.carpenter@test.com',
    title: 'Door & Window Frame Fitting / Repair',
    category: 'carpentry',
    price: 599,
    priceType: 'starting_from',
    duration: '2-4 hrs',
    description: 'Installation and repair of wooden door frames, window shutters, hinges, door locks, and plywood panels. Fixes sagging doors, swollen frames (common in Vidisha monsoon season), and broken door skins. Serves Sironj, Ganjbasoda, and Vidisha city on request.',
    tags: 'door,window,frame,hinge,repair,carpenter,monsoon,swollen wood',
    isPopular: false,
  },
  {
    providerEmail: 'ramkishan.carpenter@test.com',
    title: 'Modular Kitchen Cabinet Work',
    category: 'carpentry',
    price: 7999,
    priceType: 'starting_from',
    duration: '3-5 days',
    description: 'Design and installation of modular kitchen cabinets in WPC board, commercial plywood, or MDF with laminate or membrane shutters. Includes soft-close hinges, drawer channels, countertop support brackets, and stainless steel leg fittings. Free layout visit. Sironj, Vidisha, Ganjbasoda area.',
    tags: 'modular kitchen,kitchen cabinet,WPC,plywood,laminate,Sironj,Vidisha',
    isPopular: false,
  },

  // ── Jagdish Painting (Vidisha) ─────────────────────────────────────────────
  {
    providerEmail: 'jagdish.painter@test.com',
    title: 'Interior Wall Painting – Full Home',
    category: 'painting',
    price: 2499,
    priceType: 'starting_from',
    duration: '2-4 days',
    description: 'Full interior painting with Asian Paints Royale / Berger Silk emulsion. Includes wall putty (white cement based), 1 coat primer, and 2 finish coats. Shade selection with card at home. Approx. cost for 2BHK in Vidisha: ₹6000–10000 depending on room size and wall condition. Serving all Vidisha city wards.',
    tags: 'interior painting,Asian Paints,Berger,emulsion,wall putty,Vidisha,2BHK',
    isPopular: true,
  },
  {
    providerEmail: 'jagdish.painter@test.com',
    title: 'Exterior Waterproof & Weather Shield Painting',
    category: 'painting',
    price: 3499,
    priceType: 'starting_from',
    duration: '3-6 days',
    description: 'Exterior facade painting using Asian Paints Apex Weatherproof or Berger WeatherCoat. Includes crack filling with elastomeric compound, anti-algae primer, and 2 coats finish. Protects against Vidisha\'s heavy monsoon rains (July–Sep). Scaffolding arranged if needed. 5-year warranty on paint.',
    tags: 'exterior painting,waterproof,monsoon,Apex,WeatherCoat,Vidisha,facade',
    isPopular: false,
  },
  {
    providerEmail: 'jagdish.painter@test.com',
    title: 'POP False Ceiling & Texture Painting',
    category: 'painting',
    price: 1499,
    priceType: 'starting_from',
    duration: '1-3 days',
    description: 'Plaster of Paris (POP) false ceiling design and installation for living rooms and bedrooms. Also provides sand texture, lace texture, sponge, and stencil decorative wall painting. Popular for new homes in SATI area and New Colony, Vidisha. Free design consultation.',
    tags: 'POP ceiling,texture painting,false ceiling,decorative,SATI,New Colony,Vidisha',
    isPopular: false,
  },

  // ── Balram Gardening (Vidisha) ─────────────────────────────────────────────
  {
    providerEmail: 'balram.garden@test.com',
    title: 'Home Garden Design & Landscaping',
    category: 'gardening',
    price: 999,
    priceType: 'starting_from',
    duration: '4-6 hrs',
    description: 'Professional garden design for homes in Vidisha. Services include soil preparation, decorative plant arrangement, Doob / Korean grass lawn laying, seasonal flower bed planting (marigold, zinnia, dahlia), and drip irrigation setup. Plants sourced from Udaygiri Road nursery, Vidisha.',
    tags: 'garden,landscaping,lawn,plants,Vidisha,Doob grass,drip irrigation',
    isPopular: false,
  },
  {
    providerEmail: 'balram.garden@test.com',
    title: 'Monthly Garden Maintenance Contract',
    category: 'gardening',
    price: 799,
    priceType: 'fixed',
    duration: '4 visits/month',
    description: 'Monthly garden maintenance package: 4 visits/month covering trimming, weeding, fertiliser application (vermicompost), seasonal pest spray, and watering schedule guidance. Ideal for government quarter bungalows in Civil Lines and private residences in Satpura Colony, Vidisha.',
    tags: 'garden maintenance,monthly,trimming,fertiliser,Civil Lines,Satpura,Vidisha',
    isPopular: false,
  },

  // ── Keetatantra Pest Control (Vidisha) ────────────────────────────────────
  {
    providerEmail: 'suresh.pest@test.com',
    title: 'Complete Home Pest Control Treatment',
    category: 'pest',
    price: 799,
    priceType: 'fixed',
    duration: '2-3 hrs',
    description: 'Comprehensive pest control for cockroaches, ants, silverfish, lizards, and spiders. Gel treatment (odourless, kitchen-safe) + spray treatment for all rooms. WHO-approved chemicals. Safe after 2 hours drying time — children and pets can re-enter. 3-month service warranty. Covers Vidisha city, all wards.',
    tags: 'pest control,cockroach,lizard,ant,gel treatment,spray,Vidisha,WHO approved',
    isPopular: true,
  },
  {
    providerEmail: 'suresh.pest@test.com',
    title: 'Anti-Termite Treatment (Pre / Post Construction)',
    category: 'pest',
    price: 1499,
    priceType: 'starting_from',
    duration: '3-5 hrs',
    description: 'MP Government licensed anti-termite soil treatment for new construction and chemical injection/drilling for existing structures. Covers foundation trenches, walls, window/door frames, and wooden fixtures. 5-year guarantee with annual free inspection. Valid for bank loan documentation. Licence No. VDS-PCO-2019-047.',
    tags: 'anti termite,termite,white ant,pre construction,bank loan,Vidisha,licensed',
    isPopular: true,
  },
  {
    providerEmail: 'suresh.pest@test.com',
    title: 'Mosquito Fogging & Dengue Prevention',
    category: 'pest',
    price: 599,
    priceType: 'fixed',
    duration: '1-2 hrs',
    description: 'Thermal fogging and residual spray for mosquito control targeting dengue vectors (Aedes aegypti) and malaria mosquitoes. Critical during Vidisha monsoon season (July–October) when Betwa River flooding increases mosquito breeding. Covers home + garden + drain area (up to 1500 sq ft). Nagar Palika empanelled.',
    tags: 'mosquito,dengue,fogging,Vidisha,monsoon,malaria,Betwa,prevention',
    isPopular: false,
  },

  // ── Mohan Painting (Shamshabad) ────────────────────────────────────────────
  {
    providerEmail: 'mohan.painter@test.com',
    title: 'Lime Wash & Distemper Painting – Rural Homes',
    category: 'painting',
    price: 799,
    priceType: 'starting_from',
    duration: '1-2 days',
    description: 'Affordable lime wash and acrylic distemper painting for homes in Shamshabad, Lateri, and surrounding villages. Covers inside walls and outside boundary walls. Popular choice before festivals and for government-scheme houses (Pradhan Mantri Awas Yojana). Team of 4 painters available.',
    tags: 'lime wash,distemper,affordable,Shamshabad,Lateri,rural,PMAY',
    isPopular: false,
  },

  // ── Reena Cleaning (Kurwai) ────────────────────────────────────────────────
  {
    providerEmail: 'reena.clean@test.com',
    title: 'Home Cleaning – Kurwai & Nearby Areas',
    category: 'cleaning',
    price: 499,
    priceType: 'starting_from',
    duration: '3-5 hrs',
    description: 'SHG-run cleaning service for homes in Kurwai tehsil. Covers sweeping, mopping, bathroom cleaning, and kitchen surfaces. Affordable rates suited to Kurwai town and surrounding village households. Available for one-time cleaning or monthly contract. Contact for festival special rates.',
    tags: 'home cleaning,Kurwai,SHG,affordable,monthly,festival cleaning',
    isPopular: false,
  },
]

//  SEED FUNCTION

async function seed() {
  await connectDB()
  console.log('\n' + '═'.repeat(60))
  console.log('  ServeNear — VIDISHA DISTRICT SEED')
  console.log('═'.repeat(60) + '\n')

  // ── Wipe all existing collections ─────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    ServiceProvider.deleteMany({}),
    Service.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
  ])
  console.log('🗑  Cleared all collections\n')

  // ── Create customer users ─────────────────────────────────────────────────
  const customerMap = {}   // email → User doc
  console.log('👥 Creating customers...')
  for (const c of CUSTOMERS) {
    const user = await User.create(c)   // password hashed by pre-save hook
    customerMap[c.email] = user
    console.log(`   ✔ ${c.name.padEnd(28)} ${c.address.city}`)
  }

  // ── Create provider users + provider profiles ─────────────────────────────
  const providerMap = {}   // email → ServiceProvider doc
  console.log('\n🏢 Creating providers...')
  for (const p of PROVIDERS) {
    const user = await User.create({
      name:     p.name,
      email:    p.email,
      password: p.password,
      role:     'provider',
      phone:    p.phone,
      address:  { city: p.city, state: 'Madhya Pradesh', pincode: p.pincode },
      location: { type: 'Point', coordinates: [p.coords.lng, p.coords.lat] },
    })

    const provider = await ServiceProvider.create({
      user:          user._id,
      businessName:  p.businessName,
      category:      p.category,
      bio:           p.bio,
      experience:    p.experience,
      isVerified:    p.isVerified,
      serviceRadius: p.serviceRadius,
      rating:        p.rating,
      completedJobs: p.completedJobs,
      totalEarnings: p.totalEarnings,
      isAvailable:   true,
      location: {
        type:        'Point',
        coordinates: [p.coords.lng, p.coords.lat],
        address:     p.area,
        city:        p.city,
        state:       'Madhya Pradesh',
        pincode:     p.pincode,
      },
    })

    providerMap[p.email] = provider
    const verified = p.isVerified ? '✅' : '  '
    console.log(`   ${verified} ${p.businessName.padEnd(40)} ${p.city}`)
  }

  // ── Create services ───────────────────────────────────────────────────────
  const serviceMap = {}   // title → Service doc
  console.log('\n🔧 Creating services...')
  for (const s of SERVICES) {
    const provider = providerMap[s.providerEmail]
    const svc = await Service.create({
      provider:      provider._id,
      title:         s.title,
      category:      s.category,
      description:   s.description,
      price:         s.price,
      priceType:     s.priceType,
      duration:      s.duration,
      tags:          s.tags.split(',').map(t => t.trim()),
      isPopular:     s.isPopular,
      isAvailable:   true,
      rating:        { average: 0, count: 0 },
      totalBookings: 0,
    })
    serviceMap[s.title] = svc
    const star = s.isPopular ? '🔥' : '  '
    console.log(`   ${star} ₹${String(s.price).padEnd(6)} ${s.title}`)
  }

  // ── Create sample bookings ────────────────────────────────────────────────
  const ago    = (days) => new Date(Date.now() - days * 86_400_000)
  const ahead  = (days) => new Date(Date.now() + days * 86_400_000)

  const BOOKINGS_DATA = [
    // ── Completed bookings ─────────────────────────────────────────────────
    {
      userEmail:    'rajesh.mishra@test.com',
      serviceTitle: 'Full Home Plumbing Inspection & Repair',
      providerEmail:'ramsevak.plumber@test.com',
      date: ago(15), time: '10:00 AM',
      status: 'completed',
      address: { street: 'Civil Lines, Near Collector Office', city: 'Vidisha', state: 'MP', pincode: '464001' },
      payment: { amount: 499, method: 'upi', status: 'paid' },
      isReviewed: true,
    },
    {
      userEmail:    'sunita.yadav@test.com',
      serviceTitle: 'Full Home Deep Cleaning (2–4 BHK)',
      providerEmail:'savitri.clean@test.com',
      date: ago(10), time: '9:00 AM',
      status: 'completed',
      address: { street: 'Ganj Bazar, Near Hanuman Mandir', city: 'Vidisha', state: 'MP', pincode: '464001' },
      payment: { amount: 1199, method: 'cash', status: 'paid' },
      isReviewed: true,
    },
    {
      userEmail:    'mahesh.verma@test.com',
      serviceTitle: 'AC Gas Refilling & Performance Check',
      providerEmail:'rajkumar.ac@test.com',
      date: ago(7), time: '11:00 AM',
      status: 'completed',
      address: { street: 'Sanchi Road, Opp. S.M. Dyechem', city: 'Vidisha', state: 'MP', pincode: '464001' },
      payment: { amount: 799, method: 'upi', status: 'paid' },
      isReviewed: true,
    },
    {
      userEmail:    'kavita.patel@test.com',
      serviceTitle: 'Submersible Pump & Borewell Installation',
      providerEmail:'shivprasad.plumber@test.com',
      date: ago(20), time: '9:00 AM',
      status: 'completed',
      address: { street: 'Railway Colony, Near Station', city: 'Ganjbasoda', state: 'MP', pincode: '464221' },
      payment: { amount: 1499, method: 'cash', status: 'paid' },
      isReviewed: true,
    },
    {
      userEmail:    'deepak.jain@test.com',
      serviceTitle: 'Complete Home Pest Control Treatment',
      providerEmail:'suresh.pest@test.com',
      date: ago(5), time: '10:00 AM',
      status: 'completed',
      address: { street: 'Bhopal Road, Near Bus Stand', city: 'Vidisha', state: 'MP', pincode: '464001' },
      payment: { amount: 799, method: 'card', status: 'paid' },
      isReviewed: false,
    },
    {
      userEmail:    'anita.gupta@test.com',
      serviceTitle: 'Ceiling Fan, LED Light & Switch Installation',
      providerEmail:'mukesh.electric@test.com',
      date: ago(12), time: '2:00 PM',
      status: 'completed',
      address: { street: 'Satpura Colony, Ward No. 12', city: 'Vidisha', state: 'MP', pincode: '464001' },
      payment: { amount: 199, method: 'cash', status: 'paid' },
      isReviewed: true,
    },
    {
      userEmail:    'rajesh.mishra@test.com',
      serviceTitle: 'Diwali / Festival Special Cleaning Package',
      providerEmail:'savitri.clean@test.com',
      date: ago(30), time: '9:00 AM',
      status: 'completed',
      address: { street: 'Civil Lines, Near Collector Office', city: 'Vidisha', state: 'MP', pincode: '464001' },
      payment: { amount: 999, method: 'upi', status: 'paid' },
      isReviewed: false,
    },
    {
      userEmail:    'mahesh.verma@test.com',
      serviceTitle: 'Custom Teak / Sheesham Furniture Making',
      providerEmail:'ramkishan.carpenter@test.com',
      date: ago(45), time: '10:00 AM',
      status: 'completed',
      address: { street: 'Sanchi Road, Opp. S.M. Dyechem', city: 'Vidisha', state: 'MP', pincode: '464001' },
      payment: { amount: 8500, method: 'cash', status: 'paid' },
      isReviewed: true,
    },
    // ── Confirmed upcoming ─────────────────────────────────────────────────
    {
      userEmail:    'priya.tiwari@test.com',
      serviceTitle: 'Interior Wall Painting – Full Home',
      providerEmail:'jagdish.painter@test.com',
      date: ahead(3), time: '9:00 AM',
      status: 'confirmed',
      address: { street: 'Besnagar, Heliodorus Pillar Road', city: 'Vidisha', state: 'MP', pincode: '464001' },
      payment: { amount: 6500, method: 'cash', status: 'pending' },
      isReviewed: false,
    },
    {
      userEmail:    'amit.sharma@test.com',
      serviceTitle: 'AC Annual Maintenance Contract (1 Unit)',
      providerEmail:'rajkumar.ac@test.com',
      date: ahead(5), time: '11:00 AM',
      status: 'confirmed',
      address: { street: 'New Colony, Near SATI College', city: 'Vidisha', state: 'MP', pincode: '464001' },
      payment: { amount: 1499, method: 'upi', status: 'pending' },
      isReviewed: false,
    },
    // ── Pending ────────────────────────────────────────────────────────────
    {
      userEmail:    'sunita.yadav@test.com',
      serviceTitle: 'Anti-Termite Treatment (Pre / Post Construction)',
      providerEmail:'suresh.pest@test.com',
      date: ahead(4), time: '10:00 AM',
      status: 'pending',
      address: { street: 'Ganj Bazar, Near Hanuman Mandir', city: 'Vidisha', state: 'MP', pincode: '464001' },
      payment: { amount: 1499, method: 'cash', status: 'pending' },
      isReviewed: false,
    },
    {
      userEmail:    'deepak.jain@test.com',
      serviceTitle: 'Rooftop Solar Panel Installation',
      providerEmail:'mukesh.electric@test.com',
      date: ahead(7), time: '9:00 AM',
      status: 'pending',
      address: { street: 'Bhopal Road, Near Bus Stand', city: 'Vidisha', state: 'MP', pincode: '464001' },
      payment: { amount: 12999, method: 'netbanking', status: 'pending' },
      isReviewed: false,
    },
    // ── Cancelled ──────────────────────────────────────────────────────────
    {
      userEmail:    'anita.gupta@test.com',
      serviceTitle: 'Complete Home Electrical Wiring (New / Rewiring)',
      providerEmail:'mukesh.electric@test.com',
      date: ago(3), time: '10:00 AM',
      status: 'cancelled',
      address: { street: 'Satpura Colony, Ward No. 12', city: 'Vidisha', state: 'MP', pincode: '464001' },
      payment: { amount: 3500, method: 'cash', status: 'pending' },
      isReviewed: false,
      cancellation: { cancelledBy: 'user', reason: 'Construction work delayed by contractor', cancelledAt: ago(4) },
    },
  ]

  console.log('\n📋 Creating bookings...')
  const bookingDocs = []
  for (const b of BOOKINGS_DATA) {
    const user     = customerMap[b.userEmail]
    const provider = providerMap[b.providerEmail]
    const service  = serviceMap[b.serviceTitle]

    if (!user || !provider || !service) {
      console.warn(`   ⚠ Skipping booking — missing ref: ${b.serviceTitle}`)
      continue
    }

    const doc = await Booking.create({
      user:                user._id,
      service:             service._id,
      provider:            provider._id,
      bookingDate:         b.date,
      timeSlot:            b.time,
      status:              b.status,
      address:             b.address,
      payment:             b.payment,
      isReviewed:          b.isReviewed || false,
      completedAt:         b.status === 'completed' ? b.date : undefined,
      cancellation:        b.cancellation || undefined,
    })
    bookingDocs.push({ doc, meta: b })
    await Service.findByIdAndUpdate(service._id, { $inc: { totalBookings: 1 } })
    console.log(`   ✔ [${b.status.toUpperCase().padEnd(10)}] ${b.serviceTitle.substring(0, 45)}`)
  }

  // ── reviews for completed
  const REVIEWS_DATA = [
    {
      bookingMeta: { userEmail: 'rajesh.mishra@test.com', serviceTitle: 'Full Home Plumbing Inspection & Repair' },
      rating: 5,
      comment: 'Ramsevak ji ne bahut achha kaam kiya. Civil Lines mein 2 saal se pipe ki problem thi, unhone 2 ghante mein sab theek kar diya. Rates bhi Vidisha ke market ke hisaab se bilkul sahi the. Highly recommended for anyone in Vidisha city!',
    },
    {
      bookingMeta: { userEmail: 'sunita.yadav@test.com', serviceTitle: 'Full Home Deep Cleaning (2–4 BHK)' },
      rating: 5,
      comment: 'Savitri didi ki team ne ghar chamkaa diya! Diwali ke pehle cleaning karai thi, sab log bahut achhe se kaam karte hain. Ganj Bazar area mein best cleaning service hai. Eco-friendly products use karte hain jo mujhe bahut pasand aaya. 100% recommend!',
    },
    {
      bookingMeta: { userEmail: 'mahesh.verma@test.com', serviceTitle: 'AC Gas Refilling & Performance Check' },
      rating: 4,
      comment: 'Rajkumar ji ki service achi rahi. AC mein R-32 gas daali, cooling ab pehle jaisi ho gayi. Sanchi road se thoda dur hain unka workshop lekin doorstep aaye. Ek star kam isliye ki thoda wait karna pada. Overall satisfied with the AC service in Vidisha.',
    },
    {
      bookingMeta: { userEmail: 'kavita.patel@test.com', serviceTitle: 'Submersible Pump & Borewell Installation' },
      rating: 4,
      comment: 'Ganjbasoda mein pump installation ke liye Shivprasad ji sabse best hain. Kirloskar pump fit kiya, kaam mast hua. Warranty bhi di hai. Thoda late aaye but quality mein koi shikayat nahi.',
    },
    {
      bookingMeta: { userEmail: 'anita.gupta@test.com', serviceTitle: 'Ceiling Fan, LED Light & Switch Installation' },
      rating: 5,
      comment: 'Mukesh ji time pe aaye, fan aur LED lights ekdum perfect fit kiye. Wiring bhi neat aur clean hai. Satpura Colony mein unhe bahut log jaante hain. Very professional service, will definitely call again.',
    },
    {
      bookingMeta: { userEmail: 'mahesh.verma@test.com', serviceTitle: 'Custom Teak / Sheesham Furniture Making' },
      rating: 5,
      comment: 'Ramkishan ji ne humara double bed aur wardrobe banaya Sironj se — quality exceptional hai! Pure Sagwan wood use kiya, finish bhi bahut achhi. Thoda time laga but result dekhke sab bhool gaya. Best furniture maker in Vidisha district area!',
    },
  ]

  console.log('\n⭐ Creating reviews...')
  for (const r of REVIEWS_DATA) {
    const booking = bookingDocs.find(b =>
      b.meta.userEmail === r.bookingMeta.userEmail &&
      b.meta.serviceTitle === r.bookingMeta.serviceTitle
    )
    if (!booking) { console.warn(`   ⚠ Review booking not found: ${r.bookingMeta.serviceTitle}`); continue }

    await Review.create({
      booking:  booking.doc._id,
      user:     booking.doc.user,
      service:  booking.doc.service,
      provider: booking.doc.provider,
      rating:   r.rating,
      comment:  r.comment,
    })
    console.log(`   ✔ ★${r.rating} — ${r.bookingMeta.serviceTitle.substring(0, 45)}`)
  }

  // ── Final summary ──────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60))
  console.log('  ✅  VIDISHA SEED COMPLETE')
  console.log('═'.repeat(60))
  console.log(`  👤 Customers    : ${CUSTOMERS.length}`)
  console.log(`  🏢 Providers    : ${PROVIDERS.length}`)
  console.log(`  🔧 Services     : ${SERVICES.length}`)
  console.log(`  📋 Bookings     : ${bookingDocs.length}`)
  console.log(`  ⭐ Reviews      : ${REVIEWS_DATA.length}`)
  console.log()
  console.log('  📍 REAL VIDISHA COORDINATES USED:')
  console.log('     City centre   23.5253°N, 77.8059°E  (pin 464001)')
  console.log('     Ganjbasoda    23.8651°N, 77.9412°E  (pin 464221)')
  console.log('     Gyaraspur     23.7622°N, 77.9452°E  (pin 464331)')
  console.log('     Sironj        24.0476°N, 77.6905°E  (pin 464228)')
  console.log('     Shamshabad    23.4592°N, 77.9512°E  (pin 464111)')
  console.log('     Kurwai        23.7860°N, 77.9900°E  (pin 464224)')
  console.log()
  console.log('  🔑  TEST CREDENTIALS  (password: test1234)')
  console.log()
  console.log('  CUSTOMERS')
  console.log('  ─────────────────────────────────────────────────────')
  CUSTOMERS.forEach(c =>
    console.log(`  ${c.email.padEnd(32)} ${c.address.city}`)
  )
  console.log()
  console.log('  PROVIDERS')
  console.log('  ─────────────────────────────────────────────────────')
  PROVIDERS.forEach(p =>
    console.log(`  ${p.email.padEnd(36)} ${p.city} — ${p.category}`)
  )
  console.log()
  console.log('  🌐  http://localhost:5173')
  console.log('  📡  http://localhost:5000/api/health')
  console.log('═'.repeat(60) + '\n')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message)
  console.error(err.stack)
  process.exit(1)
})




























































































// /**
//  * Seed script — run once to populate DB with sample data
//  * Usage: node server/utils/seedData.js
//  */

// require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
// const mongoose  = require('mongoose')
// const bcrypt    = require('bcryptjs')
// const connectDB = require('../config/db')

// const User            = require('../models/User')
// const ServiceProvider = require('../models/ServiceProvider')
// const Service         = require('../models/Service')

// const SEED_USERS = [
//   // Customers
//   { name: 'Priya Sharma',   email: 'priya@test.com',   password: 'test1234', role: 'user',     phone: '9876543210' },
//   { name: 'Amit Verma',     email: 'amit@test.com',    password: 'test1234', role: 'user',     phone: '9876543211' },
//   // Providers
//   { name: 'Ramesh Kumar',   email: 'ramesh@test.com',  password: 'test1234', role: 'provider', phone: '9876543212' },
//   { name: 'Suresh Electric',email: 'suresh@test.com',  password: 'test1234', role: 'provider', phone: '9876543213' },
//   { name: 'CleanPro Team',  email: 'clean@test.com',   password: 'test1234', role: 'provider', phone: '9876543214' },
//   { name: 'CoolTech AC',    email: 'cooltech@test.com',password: 'test1234', role: 'provider', phone: '9876543215' },
//   { name: 'GreenThumb',     email: 'green@test.com',   password: 'test1234', role: 'provider', phone: '9876543216' },
//   { name: 'BugFree Pest',   email: 'bugfree@test.com', password: 'test1234', role: 'provider', phone: '9876543217' },
// ]

// const SEED_PROVIDERS = [
//   { email: 'ramesh@test.com',   category: 'plumbing',   businessName: 'Ramesh Plumbing Works',  experience: 8,  city: 'Bhopal',     lat: 23.2599, lng: 77.4126 },
//   { email: 'suresh@test.com',   category: 'electrical', businessName: 'Suresh Electricals',     experience: 6,  city: 'Bhopal',     lat: 23.2560, lng: 77.4020 },
//   { email: 'clean@test.com',    category: 'cleaning',   businessName: 'CleanPro Services',      experience: 5,  city: 'Bhopal',     lat: 23.2640, lng: 77.4200 },
//   { email: 'cooltech@test.com', category: 'ac',         businessName: 'CoolTech Solutions',     experience: 7,  city: 'Bhopal',     lat: 23.2510, lng: 77.4080 },
//   { email: 'green@test.com',    category: 'gardening',  businessName: 'GreenThumb Gardeners',   experience: 4,  city: 'Bhopal',     lat: 23.2680, lng: 77.4150 },
//   { email: 'bugfree@test.com',  category: 'pest',       businessName: 'BugFree Pest Control',   experience: 9,  city: 'Bhopal',     lat: 23.2545, lng: 77.4300 },
// ]

// // const SEED_PROVIDERS = [
// //   {
// //     email: 'hr@test.com',
// //     category: 'plumbing',
// //     businessName: 'H R TRADERS',
// //     experience: 8,
// //     city: 'Vidisha',
// //     lat: 23.5235,
// //     lng: 77.8080,
// //   },

// //   {
// //     email: 'shyam@test.com',
// //     category: 'electrical',
// //     businessName: "Shyam Electrical's Vidisha",
// //     experience: 7,
// //     city: 'Vidisha',
// //     lat: 23.5222,
// //     lng: 77.8104,
// //   },

// //   {
// //     email: 'resq@test.com',
// //     category: 'ac',
// //     businessName: 'Reliance resQ - Happy Service Centre',
// //     experience: 10,
// //     city: 'Vidisha',
// //     lat: 23.5250,
// //     lng: 77.8150,
// //   },

// //   {
// //     email: 'vinayak@test.com',
// //     category: 'ac',
// //     businessName: 'Vinayak refrigeration',
// //     experience: 9,
// //     city: 'Vidisha',
// //     lat: 23.5190,
// //     lng: 77.8095,
// //   },

// //   {
// //     email: 'namami@test.com',
// //     category: 'cleaning',
// //     businessName: 'Namami Cleans',
// //     experience: 5,
// //     city: 'Vidisha',
// //     lat: 23.5241,
// //     lng: 77.8065,
// //   },

// //   {
// //     email: 'gaurvi@test.com',
// //     category: 'pest',
// //     businessName: "Gaurvi Trader's",
// //     experience: 6,
// //     city: 'Vidisha',
// //     lat: 23.5210,
// //     lng: 77.8120,
// //   },
// // ]

// const SEED_SERVICES = [
//   { providerEmail: 'ramesh@test.com',   title: 'Full Home Plumbing Repair',   category: 'plumbing',   price: 599,  duration: '2-4 hrs', description: 'Complete plumbing diagnosis and repair for all types of leaks, pipe issues, and installations.',  tags: 'leak,pipe,repair,emergency', popular: true  },
//   { providerEmail: 'ramesh@test.com',   title: 'Bathroom Plumbing Fix',       category: 'plumbing',   price: 349,  duration: '1-2 hrs', description: 'Fixing bathroom leaks, taps, showers, and drain blockages quickly and professionally.',             tags: 'bathroom,tap,shower,drain',  popular: false },
//   { providerEmail: 'suresh@test.com',   title: 'Electrical Wiring & Fitting', category: 'electrical', price: 799,  duration: '3-5 hrs', description: 'Safe and professional electrical wiring, switch fitting, and panel upgrades for homes and offices.',   tags: 'wiring,switch,panel,safety', popular: false },
//   { providerEmail: 'suresh@test.com',   title: 'Fan & Light Installation',    category: 'electrical', price: 299,  duration: '1-2 hrs', description: 'Quick and clean installation of ceiling fans, tube lights, LED strips, and other fixtures.',            tags: 'fan,light,led,installation', popular: false },
//   { providerEmail: 'clean@test.com',    title: 'Deep Home Cleaning',          category: 'cleaning',   price: 1299, duration: '4-6 hrs', description: 'Full deep cleaning of your home including kitchen, bathrooms, all rooms, and common areas.',            tags: 'deep clean,home,kitchen,bathroom', popular: true  },
//   { providerEmail: 'clean@test.com',    title: 'Kitchen Deep Cleaning',       category: 'cleaning',   price: 599,  duration: '2-3 hrs', description: 'Thorough kitchen cleaning including chimney, stove, tiles, cabinets, and all appliances.',              tags: 'kitchen,chimney,tiles,grease', popular: true  },
//   { providerEmail: 'cooltech@test.com', title: 'AC Service & Gas Refill',     category: 'ac',         price: 699,  duration: '1-2 hrs', description: 'Full AC servicing, filter cleaning, gas top-up, and performance check for all brands.',                tags: 'ac,service,gas,cooling', popular: true  },
//   { providerEmail: 'cooltech@test.com', title: 'AC Installation',             category: 'ac',         price: 999,  duration: '2-3 hrs', description: 'Professional installation of split and window ACs with copper pipe and stabiliser fitting.',              tags: 'ac,install,split,window',    popular: false },
//   { providerEmail: 'green@test.com',    title: 'Garden Landscaping',          category: 'gardening',  price: 999,  duration: '3-5 hrs', description: 'Transform your garden with professional landscaping, trimming, planting, and soil treatment.',           tags: 'garden,lawn,plants,trimming', popular: false },
//   { providerEmail: 'bugfree@test.com',  title: 'Pest & Termite Control',      category: 'pest',       price: 849,  duration: '2-3 hrs', description: 'Complete pest control treatment for your entire home. Eco-safe chemicals used — safe for kids and pets.', tags: 'pest,termite,cockroach,safe', popular: false },
// ]

// // const SEED_SERVICES = [
// //   {
// //     providerEmail: 'hr@test.com',
// //     title: 'Bathroom & Pipe Leakage Repair',
// //     category: 'plumbing',
// //     price: 499,
// //     duration: '1-2 hrs',
// //     description: 'Local plumbing repair service for leakage, tap fitting, and bathroom pipe issues.',
// //     tags: 'pipe,leak,bathroom,tap',
// //     popular: true,
// //   },

// //   {
// //     providerEmail: 'shyam@test.com',
// //     title: 'House Wiring & Fan Installation',
// //     category: 'electrical',
// //     price: 799,
// //     duration: '2-4 hrs',
// //     description: 'Electrical wiring, switchboard fitting, fan and light installation service.',
// //     tags: 'wiring,fan,light,switch',
// //     popular: true,
// //   },

// //   {
// //     providerEmail: 'resq@test.com',
// //     title: 'AC Repair & Gas Refill',
// //     category: 'ac',
// //     price: 699,
// //     duration: '1-2 hrs',
// //     description: 'AC cooling repair, servicing and gas refill for split/window AC.',
// //     tags: 'ac,repair,gas,cooling',
// //     popular: true,
// //   },

// //   {
// //     providerEmail: 'vinayak@test.com',
// //     title: 'Split AC Installation',
// //     category: 'ac',
// //     price: 1199,
// //     duration: '2-3 hrs',
// //     description: 'Professional split AC installation and copper pipe fitting.',
// //     tags: 'ac,split,installation',
// //     popular: false,
// //   },

// //   {
// //     providerEmail: 'namami@test.com',
// //     title: 'Deep Home Cleaning',
// //     category: 'cleaning',
// //     price: 1499,
// //     duration: '4-6 hrs',
// //     description: 'Full home deep cleaning service including kitchen and bathroom cleaning.',
// //     tags: 'cleaning,home,kitchen,bathroom',
// //     popular: true,
// //   },

// //   {
// //     providerEmail: 'gaurvi@test.com',
// //     title: 'Termite & Pest Control',
// //     category: 'pest',
// //     price: 899,
// //     duration: '2-3 hrs',
// //     description: 'Pest control treatment for termites, cockroaches and mosquitoes.',
// //     tags: 'termite,pest,mosquito',
// //     popular: true,
// //   },
// // ]

// async function seed() {
//   await connectDB()
//   console.log('\n🌱 Starting seed...\n')

//   // Clear existing data
//   await Promise.all([
//     User.deleteMany({}),
//     ServiceProvider.deleteMany({}),
//     Service.deleteMany({}),
//   ])
//   console.log('🗑  Cleared existing data')

//   // Create users
//   const createdUsers = {}
//   for (const u of SEED_USERS) {
//     const user = await User.create(u)          // pre-save hook hashes password
//     createdUsers[u.email] = user
//     console.log(`👤 Created user: ${u.name} (${u.role})`)
//   }

//   // Create provider profiles
//   const createdProviders = {}
//   for (const p of SEED_PROVIDERS) {
//     const user = createdUsers[p.email]
//     const provider = await ServiceProvider.create({
//       user:         user._id,
//       businessName: p.businessName,
//       category:     p.category,
//       bio:          `Professional ${p.category} service provider with ${p.experience} years of experience. Trusted by hundreds of happy customers.`,
//       experience:   p.experience,
//       isVerified:   true,
//       location: {
//         type:        'Point',
//         coordinates: [p.lng, p.lat],
//         city:        p.city,
//         state:       'Madhya Pradesh',
//         pincode:     '462001',
//         address:     `${p.city}, MP`,
//       },
//     })
//     createdProviders[p.email] = provider
//     console.log(`🏢 Created provider: ${p.businessName}`)
//   }

//   // Create services
//   for (const s of SEED_SERVICES) {
//     const provider = createdProviders[s.providerEmail]
//     await Service.create({
//       provider:    provider._id,
//       title:       s.title,
//       category:    s.category,
//       description: s.description,
//       price:       s.price,
//       priceType:   'fixed',
//       duration:    s.duration,
//       tags:        s.tags.split(',').map(t => t.trim()),
//       isPopular:   s.popular,
//       isAvailable: true,
//     })
//     console.log(`🔧 Created service: ${s.title}`)
//   }

//   console.log('\n✅ Seed complete!\n')
//   console.log('📋 Test credentials:')
//   console.log('   User:     priya@test.com  / test1234')
//   console.log('   Provider: ramesh@test.com / test1234')
//   console.log()

//   await mongoose.disconnect()
//   process.exit(0)
// }

// seed().catch(err => {
//   console.error('❌ Seed failed:', err)
//   process.exit(1)
// })

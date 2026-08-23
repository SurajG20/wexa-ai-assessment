/**
 * Regions and suppliers with their manufacturing footprint.
 * Company names and site locations approximate public knowledge; unit
 * economics are illustrative estimates for demonstration purposes.
 */

export type RegionDef = {
  iso: string;
  name: string;
  continent: "Asia" | "Europe" | "North America" | "South America";
  /** Illustrative geopolitical / disruption risk score (0–100). */
  riskIndex: number;
};

export type FacilityDef = {
  id: string;
  name: string;
  city: string;
  region: string;
  type: "fab" | "osat" | "assembly" | "test";
};

export type SupplierDef = {
  id: string;
  name: string;
  hq: string;
  facilities: Omit<FacilityDef, "region">[];
};

export const REGIONS: RegionDef[] = [
  { iso: "TW", name: "Taiwan", continent: "Asia", riskIndex: 84 },
  { iso: "KR", name: "South Korea", continent: "Asia", riskIndex: 58 },
  { iso: "CN", name: "Mainland China", continent: "Asia", riskIndex: 71 },
  { iso: "JP", name: "Japan", continent: "Asia", riskIndex: 22 },
  { iso: "US", name: "United States", continent: "North America", riskIndex: 30 },
  { iso: "DE", name: "Germany", continent: "Europe", riskIndex: 18 },
  { iso: "NL", name: "Netherlands", continent: "Europe", riskIndex: 12 },
  { iso: "MY", name: "Malaysia", continent: "Asia", riskIndex: 33 },
  { iso: "VN", name: "Vietnam", continent: "Asia", riskIndex: 41 },
  { iso: "TH", name: "Thailand", continent: "Asia", riskIndex: 38 },
  { iso: "PH", name: "Philippines", continent: "Asia", riskIndex: 45 },
  { iso: "SG", name: "Singapore", continent: "Asia", riskIndex: 15 },
  { iso: "IN", name: "India", continent: "Asia", riskIndex: 47 },
  { iso: "IL", name: "Israel", continent: "Asia", riskIndex: 80 },
  { iso: "MX", name: "Mexico", continent: "North America", riskIndex: 44 },
  { iso: "CZ", name: "Czechia", continent: "Europe", riskIndex: 14 },
  { iso: "HU", name: "Hungary", continent: "Europe", riskIndex: 21 },
  { iso: "PL", name: "Poland", continent: "Europe", riskIndex: 17 },
  { iso: "GB", name: "United Kingdom", continent: "Europe", riskIndex: 16 },
  { iso: "IE", name: "Ireland", continent: "Europe", riskIndex: 10 },
  { iso: "FR", name: "France", continent: "Europe", riskIndex: 19 },
  { iso: "IT", name: "Italy", continent: "Europe", riskIndex: 20 },
  { iso: "AT", name: "Austria", continent: "Europe", riskIndex: 11 },
  { iso: "CH", name: "Switzerland", continent: "Europe", riskIndex: 8 },
  { iso: "SE", name: "Sweden", continent: "Europe", riskIndex: 9 },
  { iso: "CA", name: "Canada", continent: "North America", riskIndex: 13 },
];

function f(id: string, name: string, city: string, type: FacilityDef["type"]): Omit<FacilityDef, "region"> {
  return { id, name, city, type };
}

export const SUPPLIERS: SupplierDef[] = [
  {
    id: "tsmc",
    name: "TSMC",
    hq: "TW",
    facilities: [
      f("tsmc-fab18", "Fab 18 (N3/N5)", "Tainan", "fab"),
      f("tsmc-fab15", "Fab 15 (N7)", "Taichung", "fab"),
      f("tsmc-fab12", "Fab 12 (N16)", "Hsinchu", "fab"),
      f("tsmc-fabaz", "Fab 21 Phase 1", "Phoenix", "fab"),
      f("tsmc-ap6", "Advanced Packaging Fab 6", "Miaoli", "osat"),
    ],
  },
  {
    id: "samsung-semi",
    name: "Samsung Electronics Foundry",
    hq: "KR",
    facilities: [
      f("ss-hwaseong", "Hwaseong Campus", "Hwaseong", "fab"),
      f("ss-pyeongtaek", "Pyeongtaek Campus", "Pyeongtaek", "fab"),
      f("ss-taylor", "Taylor Fab", "Taylor", "fab"),
    ],
  },
  {
    id: "skhynix",
    name: "SK Hynix",
    hq: "KR",
    facilities: [
      f("hynix-icheon", "M14 Icheon", "Icheon", "fab"),
      f("hynix-cheongju", "M15 Cheongju", "Cheongju", "fab"),
      f("hynix-wuxi", "Wuxi DRAM Plant", "Wuxi", "fab"),
    ],
  },
  {
    id: "micron",
    name: "Micron Technology",
    hq: "US",
    facilities: [
      f("micron-taichung", "Fab 11 Taichung", "Taichung", "fab"),
      f("micron-hiroshima", "Hiroshima Fab", "Hiroshima", "fab"),
      f("micron-boise", "Boise R&D Fab", "Boise", "fab"),
      f("micron-singapore", "Singapore Fab 10N", "Singapore", "fab"),
    ],
  },
  {
    id: "intel-foundry",
    name: "Intel Foundry",
    hq: "US",
    facilities: [
      f("intel-arizona", "Fab 52 Ocotillo", "Chandler", "fab"),
      f("intel-oregon", "D1X Hudson Ranch", "Hillsboro", "fab"),
      f("intel-leixlip", "Fab 34", "Leixlip", "fab"),
    ],
  },
  {
    id: "globalfoundries",
    name: "GlobalFoundries",
    hq: "US",
    facilities: [
      f("gf-malta", "Fab 8", "Malta", "fab"),
      f("gf-dresden", "Fab 1", "Dresden", "fab"),
      f("gf-singapore", "Fab 7A", "Woodlands", "fab"),
    ],
  },
  {
    id: "umc",
    name: "United Microelectronics (UMC)",
    hq: "TW",
    facilities: [
      f("umc-hsinchu", "Fab 12A", "Hsinchu", "fab"),
      f("umc-tainan", "Fab 14", "Tainan Science Park", "fab"),
      f("umc-singapore", "Fab 12i", "Pasir Ris", "fab"),
    ],
  },
  {
    id: "smic",
    name: "SMIC",
    hq: "CN",
    facilities: [
      f("smic-shanghai", "S2 Shanghai", "Shanghai", "fab"),
      f("smic-beijing", "B2 Beijing", "Beijing", "fab"),
      f("smic-shenzhen", "S3 Shenzhen", "Shenzhen", "fab"),
    ],
  },
  {
    id: "tower-semi",
    name: "Tower Semiconductor",
    hq: "IL",
    facilities: [
      f("tower-migdal", "Fab 2 Migdal HaEmek", "Migdal HaEmek", "fab"),
      f("tower-newport", "Fab 3 Newport Beach", "Newport Beach", "fab"),
    ],
  },
  {
    id: "texas-instruments",
    name: "Texas Instruments",
    hq: "US",
    facilities: [
      f("ti-dallas", "DMOS6 Dallas", "Dallas", "fab"),
      f("ti-lehi", "LFAB Lehi", "Lehi", "fab"),
      f("ti-klg", "Kilby Labs Assembly", "Manila", "assembly"),
    ],
  },
  {
    id: "analog-devices",
    name: "Analog Devices",
    hq: "US",
    facilities: [
      f("adi-wilmington", "Wilmington Fab", "Wilmington", "fab"),
      f("adi-limerick", "Limerick Micro-Electronics Center", "Limerick", "test"),
    ],
  },
  {
    id: "infineon",
    name: "Infineon Technologies",
    hq: "DE",
    facilities: [
      f("ifx-dresden", "Fab 1 Dresden", "Dresden", "fab"),
      f("ifx-villach", "Fab 2 Villach", "Villach", "fab"),
      f("ifx-kulim", "Front End Kulim", "Kulim", "fab"),
      f("ifx-melaka", "Back End Melaka", "Melaka", "osat"),
    ],
  },
  {
    id: "stmicro",
    name: "STMicroelectronics",
    hq: "FR",
    facilities: [
      f("stm-crolles", "Crolles 300mm", "Crolles", "fab"),
      f("stm-catania", "Catania SiC Campus", "Catania", "fab"),
      f("stm-singapore", "Ang Mo Kio Fab", "Singapore", "fab"),
      f("stm-calamba", "Calamba Assembly & Test", "Calamba", "osat"),
    ],
  },
  {
    id: "nxp",
    name: "NXP Semiconductors",
    hq: "NL",
    facilities: [
      f("nxp-eindhoven", "Wafer Fab Eindhoven", "Eindhoven", "fab"),
      f("nxp-austin", "Oak Hill Austin", "Austin", "fab"),
      f("nxp-kaohsiung", "Kaohsiung ATC", "Kaohsiung", "osat"),
    ],
  },
  {
    id: "renesas",
    name: "Renesas Electronics",
    hq: "JP",
    facilities: [
      f("renesas-naka", "Naka Fab", "Hitachinaka", "fab"),
      f("renesas-kawashiri", "Kawashiri Fab", "Kofu", "fab"),
      f("renesas-beijing", "Beijing Test Site", "Beijing", "test"),
    ],
  },
  {
    id: "qualcomm",
    name: "Qualcomm",
    hq: "US",
    facilities: [f("qc-san-diego", "San Diego Design & Validation", "San Diego", "test"), f("qc-taiwan", "Taoyuan Test Center", "Taoyuan", "test")],
  },
  {
    id: "broadcom",
    name: "Broadcom",
    hq: "US",
    facilities: [f("avgo-fort-collins", "Fort Collins Design Center", "Fort Collins", "test"), f("avgo-penang", "Penang Operations", "Bayan Lepas", "test")],
  },
  {
    id: "skyworks",
    name: "Skyworks Solutions",
    hq: "US",
    facilities: [
      f("swks-newbury", "Newbury Park Fab", "Newbury Park", "fab"),
      f("swks-mexicali", "Mexicali Front/Back-End", "Mexicali", "osat"),
    ],
  },
  {
    id: "qorvo",
    name: "Qorvo",
    hq: "US",
    facilities: [
      f("qorvo-greensboro", "Greensboro Fab", "Greensboro", "fab"),
      f("qorvo-richardson", "Richardson GaAs Fab", "Richardson", "fab"),
      f("qorvo-beijing", "Beijing Assembly & Test", "Beijing", "osat"),
    ],
  },
  {
    id: "mediatek",
    name: "MediaTek",
    hq: "TW",
    facilities: [f("mtk-hsinchu", "Hsinchu Design & Test", "Hsinchu", "test")],
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    hq: "US",
    facilities: [f("nvda-santa-clara", "Santa Clara Validation Lab", "Santa Clara", "test"), f("nvda-taipei", "Taipei Systems Integration", "Taipei", "assembly")],
  },
  {
    id: "sony-semi",
    name: "Sony Semiconductor Solutions",
    hq: "JP",
    facilities: [
      f("sony-nagasaki", "Nagasaki Technology Center", "Isahaya", "fab"),
      f("sony-yamagata", "Yamagata Fab", "Kaminoyama", "fab"),
    ],
  },
  {
    id: "omnivision",
    name: "OmniVision Technologies",
    hq: "CN",
    facilities: [f("ov-shanghai", "Shanghai Design & Test", "Shanghai", "test")],
  },
  {
    id: "bosch-sensortec",
    name: "Bosch Sensortec",
    hq: "DE",
    facilities: [
      f("bosch-reutlingen", "Reutlingen Wafer Fab", "Reutlingen", "fab"),
      f("bosch-penang", "Penang Assembly", "Penang", "osat"),
    ],
  },
  {
    id: "samsung-display",
    name: "Samsung Display",
    hq: "KR",
    facilities: [
      f("sdc-asan", "Asan OLED Line", "Asan", "fab"),
      f("sdc-giwon", "Giwon Module Plant", "Cheonan", "assembly"),
    ],
  },
  {
    id: "lg-display",
    name: "LG Display",
    hq: "KR",
    facilities: [
      f("lgd-paju", "Paju OLED Complex", "Paju", "fab"),
      f("lgd-guangzhou", "Guangzhou OLED Fab", "Guangzhou", "fab"),
    ],
  },
  {
    id: "boe",
    name: "BOE Technology",
    hq: "CN",
    facilities: [
      f("boe-chengdu", "B16 Chengdu", "Chengdu", "fab"),
      f("boe-heyuan", "Heyuan Module Plant", "Heyuan", "assembly"),
    ],
  },
  {
    id: "innolux",
    name: "Innolux Corporation",
    hq: "TW",
    facilities: [f("innolux-tainan", "Fab 14 Tainan", "Tainan", "fab")],
  },
  {
    id: "murata",
    name: "Murata Manufacturing",
    hq: "JP",
    facilities: [
      f("murata-fukui", "Fukui Plant", "Fukui", "fab"),
      f("murata-wuxi", "Wuxi Production Base", "Wuxi", "assembly"),
      f("murata-philippines", "Laguna Plant", "Laguna", "assembly"),
    ],
  },
  {
    id: "tdk",
    name: "TDK Corporation",
    hq: "JP",
    facilities: [
      f("tdk-narita", "Narita Plant", "Narita", "fab"),
      f("tdk-zhuhai", "Zhuhai Plant", "Zhuhai", "assembly"),
    ],
  },
  {
    id: "semco",
    name: "Samsung Electro-Mechanics",
    hq: "KR",
    facilities: [
      f("semco-busan", "Busan MLCC Plant", "Busan", "fab"),
      f("semco-tianjin", "Tianjin Plant", "Tianjin", "assembly"),
    ],
  },
  {
    id: "yageo",
    name: "Yageo Corporation",
    hq: "TW",
    facilities: [
      f("yageo-kaohsiung", "Kaohsiung Resistor Plant", "Kaohsiung", "fab"),
      f("yageo-suzhou", "Suzhou Plant", "Suzhou", "assembly"),
    ],
  },
  {
    id: "te-connectivity",
    name: "TE Connectivity",
    hq: "CH",
    facilities: [
      f("te-shanghai", "Shanghai Connector Plant", "Shanghai", "assembly"),
      f("te-penang", "Penang Plant", "Penang", "assembly"),
    ],
  },
  {
    id: "molex",
    name: "Molex",
    hq: "US",
    facilities: [
      f("molex-lisle", "Lisle HQ Engineering", "Lisle", "test"),
      f("molex-dongguan", "Dongguan Plant", "Dongguan", "assembly"),
    ],
  },
  {
    id: "atl",
    name: "Amperex Technology (ATL)",
    hq: "CN",
    facilities: [
      f("atl-ningde", "Ningde Cell Plant", "Ningde", "fab"),
      f("atl-dongguan", "Dongguan Cell Plant", "Dongguan", "fab"),
    ],
  },
  {
    id: "lg-energy",
    name: "LG Energy Solution",
    hq: "KR",
    facilities: [
      f("lges-ochang", "Ochang Energy Plant", "Ochang", "fab"),
      f("lges-nanjing", "Nanjing Plant", "Nanjing", "fab"),
      f("lges-arizona", "Queen Creek Plant", "Queen Creek", "fab"),
    ],
  },
  {
    id: "panasonic-energy",
    name: "Panasonic Energy",
    hq: "JP",
    facilities: [
      f("pana-suminoe", "Suminoe Plant Osaka", "Osaka", "fab"),
      f("pana-degrees", "De Soto Gigafactory Line", "De Soto", "fab"),
    ],
  },
  {
    id: "catl",
    name: "CATL",
    hq: "CN",
    facilities: [
      f("catl-ningde", "Ningde Base", "Ningde", "fab"),
      f("catl-thuringia", "Erfurt Plant", "Arnstadt", "fab"),
    ],
  },
  {
    id: "unimicron",
    name: "Unimicron Technology",
    hq: "TW",
    facilities: [
      f("unimicron-taoyuan", "Taoyuan Plant 3", "Taoyuan", "fab"),
      f("unimicron-kunshan", "Kunshan Plant", "Kunshan", "fab"),
    ],
  },
  {
    id: "ibiden",
    name: "Ibiden",
    hq: "JP",
    facilities: [
      f("ibiden-gifu", "Gifu Plant", "Gifu", "fab"),
      f("ibiden-onomichi", "Onomichi Plant", "Onomichi", "fab"),
    ],
  },
  {
    id: "zhen-ding",
    name: "Zhen Ding Technology",
    hq: "TW",
    facilities: [
      f("zdt-shenzhen", "Shenzhen Plant", "Shenzhen", "fab"),
      f("zdt-huangshi", "Huangshi Plant", "Huangshi", "fab"),
    ],
  },
  {
    id: "foxconn",
    name: "Foxconn (Hon Hai)",
    hq: "TW",
    facilities: [
      f("foxconn-zhengzhou", "Zhengzhou iPhone City", "Zhengzhou", "assembly"),
      f("foxconn-shenzhen", "Longhua Science Park", "Shenzhen", "assembly"),
      f("foxconn-chennai", "Chennai Plant", "Chennai", "assembly"),
      f("foxconn-pardubice", "Pardubice Plant", "Pardubice", "assembly"),
      f("foxconn-houston", "Houston Server Plant", "Houston", "assembly"),
    ],
  },
  {
    id: "pegatron",
    name: "Pegatron",
    hq: "TW",
    facilities: [
      f("pega-shanghai", "Shanghai Changshuo", "Shanghai", "assembly"),
      f("pega-chennai", "Chennai Plant", "Chennai", "assembly"),
      f("pega-hanoi", "Nam Dinh Vu Hanoi", "Hanoi", "assembly"),
    ],
  },
  {
    id: "quanta",
    name: "Quanta Computer",
    hq: "TW",
    facilities: [
      f("quanta-taoyuan", "Taoyuan HQ Campus A1/A3", "Guishan", "assembly"),
      f("quanta-shanghai", "Pudong Campus", "Shanghai", "assembly"),
    ],
  },
  {
    id: "compal",
    name: "Compal Electronics",
    hq: "TW",
    facilities: [
      f("compal-kunshan", "Kunshan Complex", "Kunshan", "assembly"),
      f("compal-linkou", "Linkou Smart Campus", "New Taipei", "assembly"),
    ],
  },
  {
    id: "luxshare",
    name: "Luxshare Precision",
    hq: "CN",
    facilities: [
      f("lux-dongguan", "Dongguan Shijie Campus", "Dongguan", "assembly"),
      f("lux-bacninh", "Bac Ninh Plant", "Bac Ninh", "assembly"),
    ],
  },
  {
    id: "ase-group",
    name: "ASE Technology Holding",
    hq: "TW",
    facilities: [
      f("ase-kaohsiung", "K11/K12 Kaohsiung", "Kaohsiung", "osat"),
      f("ase-penang", "Penang Advanced Test", "Bayan Lepas", "test"),
    ],
  },
  {
    id: "amkor",
    name: "Amkor Technology",
    hq: "US",
    facilities: [
      f("amkor-k5", "K5 Kabushiki Kaisha", "Tokyo", "osat"),
      f("amkor-manila", "Manila Technology Center", "Laguna", "osat"),
    ],
  },
  {
    id: "jcet",
    name: "JCET Group",
    hq: "CN",
    facilities: [f("jcet-jiangyin", "Jiangyin Campus", "Jiangyin", "osat")],
  },
  {
    id: "ptt",
    name: "Powertech Technology",
    hq: "TW",
    facilities: [f("ptt-hsinchu", "Hsinchu Memory Pack", "Hsinchu", "osat")],
  },
  {
    id: "vishay",
    name: "Vishay Intertechnology",
    hq: "US",
    facilities: [
      f("vishay-newport", "Newport Wafer Fab", "Newport", "fab"),
      f("vishay-elante", "Elante Plant Bordeaux", "Bordeaux", "fab"),
    ],
  },
  {
    id: "kyocera",
    name: "Kyocera",
    hq: "JP",
    facilities: [
      f("kyocera-kagoshima", "Kagoshima Kokubu Plant", "Kirishima", "fab"),
      f("kyocera-dalian", "Dalian Plant", "Dalian", "assembly"),
    ],
  },
  {
    id: "hirose",
    name: "Hirose Electric",
    hq: "JP",
    facilities: [
      f("hirose-yokohama", "Yokohama Engineering Center", "Yokohama", "test"),
      f("hirose-zhuhai", "Zhuhai Plant", "Zhuhai", "assembly"),
    ],
  },
  {
    id: "jabil",
    name: "Jabil",
    hq: "US",
    facilities: [
      f("jabil-st-pete", "St. Petersburg Site", "St. Petersburg", "assembly"),
      f("jabil-guangzhou", "Guangzhou Site", "Guangzhou", "assembly"),
      f("jabil-wroclaw", "Wroclaw Site", "Wroclaw", "assembly"),
    ],
  },
  {
    id: "flex",
    name: "Flex Ltd.",
    hq: "SG",
    facilities: [
      f("flex-austin", "Austin Campus", "Austin", "assembly"),
      f("flex-guangdong", "Zhuhai Industrial Park", "Zhuhai", "assembly"),
    ],
  },
  {
    id: "lg-innotek",
    name: "LG Innotek",
    hq: "KR",
    facilities: [
      f("lgit-gumi", "Gumi Camera Module Plant", "Gumi", "assembly"),
      f("lgit-yantai", "Yantai Module Plant", "Yantai", "assembly"),
    ],
  },
  {
    id: "hesai",
    name: "Hesai Technology",
    hq: "CN",
    facilities: [
      f("hesai-shanghai", "Shanghai Lidar Fab", "Shanghai", "fab"),
      f("hesai-changzhou", "Changzhou Assembly", "Changzhou", "assembly"),
    ],
  },
  {
    id: "cirrus",
    name: "Cirrus Logic",
    hq: "US",
    facilities: [
      f("cirrus-austin", "Austin Mixed-Signal Design & Test", "Austin", "test"),
      f("cirrus-taichung", "Taichung Test Center", "Taichung", "test"),
    ],
  },
  {
    id: "goertek",
    name: "GoerTek",
    hq: "CN",
    facilities: [
      f("goer-weifang", "Weifang Acoustics Campus", "Weifang", "assembly"),
      f("goer-vietnam", "Bac Ninh Acoustics Plant", "Bac Ninh", "assembly"),
    ],
  },
  {
    id: "avc",
    name: "Asia Vital Components",
    hq: "TW",
    facilities: [
      f("avc-taipei", "Taipei Thermal Lab", "Taipei", "assembly"),
      f("avc-shanghai", "Shanghai Thermal Plant", "Shanghai", "assembly"),
    ],
  },
];

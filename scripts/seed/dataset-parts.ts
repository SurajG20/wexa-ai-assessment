/**
 * Component catalogue and product bill-of-materials (BOM) definitions.
 *
 * Components are catalog-level part numbers shared across many products — the
 * way a real supply chain reuses parts. Products reference them through nested
 * module trees, which gives the graph its interesting multi-hop paths:
 *
 *   (:Product)-[:HAS_MODULE]->(:Module)-[:CONTAINS*1..]->(:Component)-[:SUPPLIED_BY]->(:Supplier)-[:OPERATES]->(:Facility)-[:LOCATED_IN]->(:Region)
 */

export type Category =
  | "logic"
  | "memory"
  | "analog"
  | "rf"
  | "sensor"
  | "display"
  | "power"
  | "passive"
  | "electromechanical"
  | "substrate";

export type Source = {
  /** Supplier id (see dataset-org.ts). */
  supplier: string;
  /** Share of total demand sourced from this supplier (0–100). */
  share: number;
  /** Replenishment lead time in days. */
  leadDays: number;
  /** Illustrative purchase cost per unit (USD). */
  unitCost: number;
};

export type ComponentDef = {
  mpn: string;
  name: string;
  category: Category;
  sources: Source[];
  /** Qualified alternate components usable as second sources. */
  alts?: string[];
};

const C = (
  mpn: string,
  name: string,
  category: Category,
  sources: [supplier: string, share: number, leadDays: number, unitCost: number][],
  alts?: string[],
): ComponentDef => ({
  mpn,
  name,
  category,
  sources: sources.map(([supplier, share, leadDays, unitCost]) => ({ supplier, share, leadDays, unitCost })),
  alts,
});

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export const COMPONENTS: ComponentDef[] = [
  // ---- Application processors / compute -------------------------------
  C("soc-a18-pro", "Apple A18 Pro SoC (N3E)", "logic", [["tsmc", 100, 168, 130]]),
  C("soc-a16", "Apple A16 Bionic (N4)", "logic", [["tsmc", 100, 150, 88]]),
  C("soc-m4-max", "Apple M4 Max SoC", "logic", [["tsmc", 100, 185, 340]]),
  C("soc-m4-pro", "Apple M4 Pro SoC", "logic", [["tsmc", 100, 178, 210]]),
  C("soc-snap-8e", "Qualcomm Snapdragon 8 Elite", "logic", [
    ["samsung-semi", 65, 160, 190],
    ["tsmc", 35, 172, 195],
  ]),
  C("soc-dim-9400", "MediaTek Dimensity 9400", "logic", [["tsmc", 100, 165, 175]]),
  C("soc-tensor-g5", "Google Tensor G5", "logic", [["tsmc", 100, 162, 140]]),
  C("cpu-intel-lunar", "Intel Core Ultra 7 258V", "logic", [["intel-foundry", 100, 155, 240]]),
  C("cpu-amd-hx370", "AMD Ryzen AI 9 HX 370", "logic", [["tsmc", 100, 170, 260]]),
  C("gpu-h100", "NVIDIA H100 SXM GPU", "logic", [["tsmc", 100, 210, 12500]]),
  C("gpu-b200", "NVIDIA Blackwell B200 GPU", "logic", [["tsmc", 100, 230, 31000]]),
  C("gpu-mi300x", "AMD Instinct MI300X GPU", "logic", [["tsmc", 100, 215, 14800]]),
  C("tpu-v5p", "Google TPU v5p ASIC", "logic", [["samsung-semi", 100, 205, 8200]]),
  C("trainium2", "AWS Trainium2 Accelerator", "logic", [["tsmc", 100, 200, 6900]]),
  C("cpu-xeon-gr", "Intel Xeon 6 Granite Rapids CPU", "logic", [["intel-foundry", 100, 190, 3800]]),
  C("cpu-epyc-turin", "AMD EPYC 9005 Turin CPU", "logic", [["tsmc", 100, 188, 3400]]),
  C("apu-ps5", "Sony PlayStation 5 Custom APU", "logic", [["tsmc", 100, 150, 105]]),
  C("apu-xbox", "Microsoft Xbox Series X APU", "logic", [["tsmc", 100, 152, 98]]),
  C("soc-switch2", "Nintendo Switch 2 SoC", "logic", [["tsmc", 100, 158, 76]]),
  C("soc-watch-s10", "Apple Watch SiP (S10)", "logic", [["tsmc", 100, 140, 42]]),
  C("soc-exynos-w1600", "Exynos W1600 Wearable SoC", "logic", [["samsung-semi", 100, 142, 38]]),
  C("soc-fsd-hw4", "Tesla FSD Computer HW4 SoC", "logic", [["samsung-semi", 100, 175, 220]]),
  C("soc-eyeq6h", "Mobileye EyeQ6 High ADAS SoC", "logic", [["stmicro", 100, 168, 95]]),
  C("fpga-zynq", "AMD Zynq UltraScale+ Industrial FPGA", "logic", [["tsmc", 70, 160, 310], ["smic", 30, 145, 290]]),
  C("mcu-stm32h7", "STM32H7 Microcontroller", "logic", [["stmicro", 100, 120, 6.5]]),
  C("asic-switch-th5", "Broadcom Tomahawk 5 Switch ASIC", "logic", [["tsmc", 100, 182, 2400]]),

  // ---- Modem / RF -----------------------------------------------------
  C("modem-x80", "Qualcomm Snapdragon X80 5G Modem", "rf", [["tsmc", 100, 150, 108]]),
  C("modem-m80", "MediaTek M80 5G Modem", "rf", [["tsmc", 100, 148, 92]]),
  C("rffe-pa-qorvo", "RF Front-End PA Module", "rf", [["qorvo", 100, 115, 22]]),
  C("rffe-sw-skyworks", "Diversity Receive Module", "rf", [["skyworks", 100, 112, 15]]),
  C("filter-baw-broadcom", "BAW Filter Bank", "rf", [["broadcom", 100, 125, 11]]),
  C("filter-baw-qorvo", "BAW Filter Bank (alt)", "rf", [["qorvo", 100, 128, 12]], ["filter-baw-broadcom"]),
  C("wifi-murata-6e", "Wi-Fi 6E + Bluetooth Module", "rf", [["murata", 100, 110, 13]]),
  C("uwb-qorvo", "Ultra-Wideband Radio Chip", "rf", [["qorvo", 100, 118, 7]]),

// ---- Memory -----------------------------------------------------------
  C("dram-lpddr5x-sk", "LPDDR5X 16Gb DRAM (SK Hynix)", "memory", [["skhynix", 100, 105, 34]], ["dram-lpddr5x-mic"]),
  C("dram-lpddr5x-mic", "LPDDR5X 16Gb DRAM (Micron)", "memory", [["micron", 100, 112, 33]], ["dram-lpddr5x-sk"]),
  C("dram-lpddr5x-sam", "LPDDR5X 16Gb DRAM (Samsung)", "memory", [["samsung-semi", 100, 102, 32]], ["dram-lpddr5x-sk", "dram-lpddr5x-mic"]),
  C("dram-ddr5-mic", "DDR5 32Gb Server DRAM (Micron)", "memory", [["micron", 100, 118, 96]], ["dram-ddr5-sk"]),
  C("dram-ddr5-sk", "DDR5 32Gb Server DRAM (SK Hynix)", "memory", [["skhynix", 100, 115, 94]], ["dram-ddr5-mic"]),
  C("nand-tlc-sk", "238-Layer TLC NAND (SK Hynix)", "memory", [["skhynix", 100, 122, 58]], ["nand-tlc-mic"]),
  C("nand-tlc-mic", "232-Layer TLC NAND (Micron)", "memory", [["micron", 100, 126, 56]], ["nand-tlc-sk"]),
  C("hbm3e-sk", "HBM3E 36GB Stack (SK Hynix)", "memory", [["skhynix", 100, 165, 1450]], ["hbm3e-mic"]),
  C("hbm3e-mic", "HBM3E 36GB Stack (Micron)", "memory", [["micron", 100, 170, 1390]], ["hbm3e-sk"]),

  // ---- Display --------------------------------------------------------
  C("oled-panel-69", '6.9" LTPO OLED Panel', "display", [["samsung-display", 100, 96, 132]]),
  C("oled-panel-67-boe", '6.7" Flexible OLED Panel', "display", [["boe", 100, 92, 84]]),
  C("oled-panel-tab13", '13" Tandem OLED Tablet Panel', "display", [["lg-display", 100, 104, 285]]),
  C("oled-panel-lap14", '14.2" XDR OLED Panel', "display", [["samsung-display", 100, 106, 240]]),
  C("oled-panel-watch", '1.5" Flexible Watch OLED', "display", [["lg-display", 100, 88, 29]]),
  C("lcd-console", "Game Console Mainboard Backlit LCD", "display", [["innolux", 100, 90, 41]]),
  C("oled-switch", '7.9" Handheld OLED Panel', "display", [["boe", 100, 94, 52]]),
  C("cluster-oled-auto", 'Automotive 15" Center Cluster OLED', "display", [["lg-display", 100, 112, 190]]),

  // ---- Sensors ----------------------------------------------------------
  C("cis-main-sony", "48MP Main Camera Sensor", "sensor", [["sony-semi", 100, 135, 44]], ["cis-main-ov"]),
  C("cis-main-ov", "50MP Main Camera Sensor", "sensor", [["omnivision", 100, 128, 31]], ["cis-main-sony"]),
  C("cis-peri-sony", "Periscope Telephoto Sensor", "sensor", [["sony-semi", 100, 138, 39]]),
  C("imu-bosch", "Six-Axis MEMS IMU (Bosch)", "sensor", [["bosch-sensortec", 100, 108, 3.2]], ["imu-st"]),
  C("imu-st", "Six-Axis MEMS IMU (ST)", "sensor", [["stmicro", 100, 112, 2.9]], ["imu-bosch"]),
  C("lidar-hesai", "AT128 Automotive LiDAR", "sensor", [["hesai", 100, 145, 480]]),
  C("barometer-infineon", "MEMS Barometric Sensor", "sensor", [["infineon", 100, 104, 1.8]]),
  C("current-hall-lem", "Hall-Effect Current Sensor", "sensor", [["vishay", 100, 98, 12]]),

  // ---- Analog / power ---------------------------------------------------
  C("pmic-ti", "Multi-Rail Power Management IC", "power", [["texas-instruments", 100, 118, 9.5]], ["pmic-adi"]),
  C("pmic-adi", "Multi-Rail Power Management IC (alt)", "power", [["analog-devices", 100, 124, 10.2]], ["pmic-ti"]),
  C("charger-cirrus", "USB-C PD Fast-Charge Controller", "power", [["cirrus", 100, 116, 6.4]]),
  C("audio-cirrus", "Hi-Fi Audio Codec / Amplifier", "analog", [["cirrus", 100, 110, 5.8]]),
  C("sic-module-infineon", "SiC Traction Inverter Module", "power", [["infineon", 100, 150, 210]], ["sic-module-stm"]),
  C("sic-module-stm", "SiC Traction Inverter Module (alt)", "power", [["stmicro", 100, 156, 198]], ["sic-module-infineon"]),
  C("can-transceiver-nxp", "CAN-FD Transceiver", "analog", [["nxp", 100, 114, 2.4]], ["can-transceiver-infineon"]),
  C("can-transceiver-infineon", "CAN-FD Transceiver (alt)", "analog", [["infineon", 100, 118, 2.2]], ["can-transceiver-nxp"]),
  C("bms-afe-ti", "Battery Management AFE IC", "power", [["texas-instruments", 100, 120, 14]]),
  C("gate-driver-renesas", "Isolated Gate Driver IC", "power", [["renesas", 100, 122, 8.6]]),
  C("psu-hotswap-analog", "Server Hot-Swap Controller", "power", [["analog-devices", 100, 116, 18]]),

  // ---- Passives ---------------------------------------------------------
  C("mlcc-semco", "High-Capacity MLCC Array", "passive", [
    ["semco", 60, 92, 0.9],
    ["murata", 40, 95, 0.95],
  ], ["mlcc-yageo"]),
  C("mlcc-yageo", "Standard MLCC Array (Yageo)", "passive", [["yageo", 100, 88, 0.6]], ["mlcc-semco"]),
  C("inductor-murata", "Power Inductor Set", "passive", [["murata", 100, 94, 1.2]], ["inductor-tdk"]),
  C("inductor-tdk", "Coupled Power Inductors (TDK)", "passive", [["tdk", 100, 97, 1.3]], ["inductor-murata"]),
  C("esd-array-kyocera", "ESD Protection Array", "passive", [["kyocera", 100, 90, 0.8]]),
  C("al-poly-cap", "Conductive Polymer Capacitor", "passive", [["panasonic-energy", 100, 93, 1.6]]),

  // ---- Electromechanical --------------------------------------------------
  C("usbc-te", "USB-C Connector Assembly", "electromechanical", [["te-connectivity", 100, 86, 2.6]], ["usbc-molex"]),
  C("usbc-molex", "USB-C Connector Assembly (alt)", "electromechanical", [["molex", 100, 89, 2.4]], ["usbc-te"]),
  C("b2b-hirose", "Board-to-Board Interposer", "electromechanical", [["hirose", 100, 92, 3.4]], ["b2b-kyocera"]),
  C("b2b-kyocera", "Board-to-Board Interposer (alt)", "electromechanical", [["kyocera", 100, 95, 3.1]], ["b2b-hirose"]),
  C("vapor-chamber-avc", "Vapor Chamber Cooling Plate", "electromechanical", [["avc", 100, 78, 12]]),
  C("speaker-goertek", "Acoustic Speaker Module", "electromechanical", [["goertek", 100, 82, 4.2]]),
  C("cell-atl-21700", "21700 Lithium-Ion Cell", "power", [["atl", 70, 96, 5.4], ["catl", 30, 99, 5.1]]),
  C("cell-catl-prismatic", "Prismatic LFP Battery Cell", "power", [["catl", 100, 104, 68]], ["cell-lges"]),
  C("cell-lges", "NCM EV Battery Cell", "power", [["lg-energy", 100, 108, 74]], ["cell-catl-prismatic"]),

  // ---- Substrate / advanced packaging --------------------------------------
  C("cowos-packaging", "CoWoS Advanced Packaging Service", "substrate", [
    ["tsmc", 78, 190, 900],
    ["ase-group", 22, 175, 850],
  ]),
  C("fc-bga-ibiden", "FC-BGA Package Substrate", "substrate", [["ibiden", 100, 140, 85]], ["fc-bga-unimicron"]),
  C("fc-bga-unimicron", "FC-BGA Package Substrate (alt)", "substrate", [["unimicron", 100, 132, 79]], ["fc-bga-ibiden"]),
  C("slp-board-zdt", "HDI Slab-Like Main Board (SLP)", "substrate", [
    ["zhen-ding", 70, 84, 22],
    ["unimicron", 30, 88, 21],
  ]),
];

/** Modules that are themselves purchased assemblies (module -> SUPPLIED_BY -> Supplier). */
export const MODULE_SOURCES: Record<string, [supplier: string, leadDays: number, unitCost: number]> = {
  "cam-assembly-lg": ["lg-innotek", 96, 68],
  "cam-assembly-fox": ["foxconn", 84, 54],
  "display-mod-fox": ["foxconn", 72, 26],
  "display-mod-boe": ["boe", 70, 22],
  "battery-pack-lux": ["luxshare", 66, 34],
  "battery-pack-atl": ["atl", 60, 31],
  "server-rack-jabil": ["jabil", 45, 520],
  "server-rack-fox": ["foxconn", 42, 495],
  "audio-assy-goertek": ["goertek", 58, 19],
  "harness-fox": ["foxconn", 50, 140],
};

/* ------------------------------------------------------------------ */
/* Product BOM builders                                                */
/* ------------------------------------------------------------------ */

export type BuildNode = {
  /** Module slug (unique within a product). */
  id: string;
  name: string;
  children?: BuildNode[];
  /** Component MPNs consumed directly by this module. */
  comps?: string[];
  /** Key into MODULE_SOURCES when this module is a purchased assembly. */
  assembly?: keyof typeof MODULE_SOURCES;
};

export type ProductDef = {
  sku: string;
  name: string;
  brand: string;
  category: "Phone" | "Laptop" | "Tablet" | "Wearable" | "Audio" | "Console" | "AI System" | "EV" | "Networking";
  unitPriceUsd: number;
  annualUnits: number;
  tree: BuildNode[];
};

function phoneTree(o: {
  soc: string;
  modem: string;
  dram: string;
  nand: string;
  panel: string;
  mainCam: string;
  periCam?: string;
  displayMod: keyof typeof MODULE_SOURCES;
  camAssembly: keyof typeof MODULE_SOURCES;
}): BuildNode[] {
  return [
    {
      id: "mlb",
      name: "Main Logic Board",
      children: [
        { id: "compute", name: "Compute Cluster", comps: [o.soc, o.dram, o.nand] },
        {
          id: "connectivity",
          name: "Connectivity",
          comps: [o.modem, "wifi-murata-6e", "uwb-qorvo", "esd-array-kyocera"],
        },
        { id: "power-board", name: "Power Management Board", comps: ["pmic-ti", "charger-cirrus", "inductor-murata"] },
      ],
      comps: ["slp-board-zdt", "b2b-hirose", "mlcc-semco"],
    },
    { id: "display", name: "Display Assembly", comps: [o.panel], assembly: o.displayMod },
    { id: "camera", name: "Camera System", comps: [o.mainCam, ...(o.periCam ? [o.periCam] : [])], assembly: o.camAssembly },
    { id: "rf", name: "RF Front-End", comps: ["rffe-pa-qorvo", "rffe-sw-skyworks", "filter-baw-broadcom"] },
    { id: "battery", name: "Battery Pack", comps: ["cell-atl-21700"], assembly: "battery-pack-lux" },
    { id: "thermal", name: "Enclosure & Thermal", comps: ["vapor-chamber-avc", "usbc-te", "speaker-goertek"] },
  ];
}

function laptopTree(o: { soc: string; dram: string; nand: string; panel: string }): BuildNode[] {
  return [
    {
      id: "logic-board",
      name: "Logic Board",
      children: [{ id: "compute", name: "Compute Cluster", comps: [o.soc, o.dram, o.nand] }],
      comps: ["pmic-ti", "mlcc-semco", "wifi-murata-6e", "usbc-te"],
    },
    { id: "display", name: "Display Assembly", comps: [o.panel], assembly: "display-mod-fox" },
    { id: "keyboard-trackpad", name: "Input Assembly", comps: ["slp-board-zdt"] },
    { id: "battery", name: "Battery Pack", comps: ["cell-atl-21700"], assembly: "battery-pack-atl" },
    { id: "thermal", name: "Thermal System", comps: ["vapor-chamber-avc"] },
  ];
}

function aiSystemTree(o: {
  gpu: string;
  hbm: string;
  dram: string;
  cpu?: string;
  switch?: string;
  rackAssembly: keyof typeof MODULE_SOURCES;
}): BuildNode[] {
  return [
    {
      id: "compute-tray",
      name: "Compute Tray",
      children: [
        { id: "accelerator", name: "Accelerator Module", comps: [o.gpu, o.hbm, "fc-bga-ibiden", "cowos-packaging"] },
        { id: "host", name: "Host CPU Complex", comps: [...(o.cpu ? [o.cpu] : []), o.dram] },
      ],
      comps: ["psu-hotswap-analog", "mlcc-semco"],
    },
    ...(o.switch ? [{ id: "fabric", name: "NVLink / Fabric Switch Tray", comps: [o.switch, "b2b-hirose"] }] : []),
    { id: "cooling", name: "Liquid Cooling Loop", comps: ["vapor-chamber-avc", "inductor-tdk"] },
    { id: "rack", name: "Rack Integration", assembly: o.rackAssembly },
  ];
}

function evTree(o: { adas: string; cell: string; cluster: string }): BuildNode[] {
  return [
    {
      id: "adas-domain",
      name: "ADAS Domain Controller",
      children: [{ id: "vision", name: "Vision Compute", comps: [o.adas, "dram-lpddr5x-sk"] }],
      comps: ["pmic-ti", "can-transceiver-nxp", "fpga-zynq"],
    },
    {
      id: "battery-system",
      name: "High-Voltage Battery Pack",
      children: [{ id: "cells", name: "Cell Matrix", comps: [o.cell] }],
      comps: ["bms-afe-ti", "current-hall-lem"],
    },
    { id: "traction", name: "Traction Inverter", comps: ["sic-module-infineon", "gate-driver-renesas"] },
    { id: "cockpit", name: "Digital Cockpit", comps: [o.cluster, "audio-cirrus"] },
    { id: "body-electronics", name: "Body Electronics", comps: ["mcu-stm32h7", "imu-bosch"], assembly: "harness-fox" },
  ];
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export const PRODUCTS: ProductDef[] = [
  {
    sku: "APL-PH-16PM",
    name: "iPhone 16 Pro Max",
    brand: "Apple",
    category: "Phone",
    unitPriceUsd: 1199,
    annualUnits: 85_000_000,
    tree: phoneTree({
      soc: "soc-a18-pro",
      modem: "modem-x80",
      dram: "dram-lpddr5x-sk",
      nand: "nand-tlc-sk",
      panel: "oled-panel-69",
      mainCam: "cis-main-sony",
      periCam: "cis-peri-sony",
      displayMod: "display-mod-fox",
      camAssembly: "cam-assembly-lg",
    }),
  },
  {
    sku: "APL-PH-16",
    name: "iPhone 16",
    brand: "Apple",
    category: "Phone",
    unitPriceUsd: 799,
    annualUnits: 95_000_000,
    tree: phoneTree({
      soc: "soc-a16",
      modem: "modem-x80",
      dram: "dram-lpddr5x-sk",
      nand: "nand-tlc-sk",
      panel: "oled-panel-67-boe",
      mainCam: "cis-main-sony",
      displayMod: "display-mod-fox",
      camAssembly: "cam-assembly-fox",
    }),
  },
  {
    sku: "SM-PH-S25U",
    name: "Galaxy S25 Ultra",
    brand: "Samsung",
    category: "Phone",
    unitPriceUsd: 1299,
    annualUnits: 42_000_000,
    tree: phoneTree({
      soc: "soc-snap-8e",
      modem: "modem-x80",
      dram: "dram-lpddr5x-sam",
      nand: "nand-tlc-sk",
      panel: "oled-panel-69",
      mainCam: "cis-main-sony",
      periCam: "cis-peri-sony",
      displayMod: "display-mod-boe",
      camAssembly: "cam-assembly-fox",
    }),
  },
  {
    sku: "GO-PH-P10P",
    name: "Pixel 10 Pro",
    brand: "Google",
    category: "Phone",
    unitPriceUsd: 999,
    annualUnits: 14_000_000,
    tree: phoneTree({
      soc: "soc-tensor-g5",
      modem: "modem-m80",
      dram: "dram-lpddr5x-mic",
      nand: "nand-tlc-mic",
      panel: "oled-panel-67-boe",
      mainCam: "cis-main-ov",
      periCam: "cis-peri-sony",
      displayMod: "display-mod-boe",
      camAssembly: "cam-assembly-fox",
    }),
  },
  {
    sku: "XM-PH-15PRO",
    name: "Xiaomi 15 Pro",
    brand: "Xiaomi",
    category: "Phone",
    unitPriceUsd: 749,
    annualUnits: 21_000_000,
    tree: phoneTree({
      soc: "soc-dim-9400",
      modem: "modem-m80",
      dram: "dram-lpddr5x-sam",
      nand: "nand-tlc-sk",
      panel: "oled-panel-67-boe",
      mainCam: "cis-main-ov",
      displayMod: "display-mod-boe",
      camAssembly: "cam-assembly-fox",
    }),
  },
  {
    sku: "APL-MB-14M4M",
    name: "MacBook Pro 14 (M4 Pro)",
    brand: "Apple",
    category: "Laptop",
    unitPriceUsd: 1999,
    annualUnits: 9_500_000,
    tree: laptopTree({ soc: "soc-m4-pro", dram: "dram-lpddr5x-sk", nand: "nand-tlc-sk", panel: "oled-panel-lap14" }),
  },
  {
    sku: "APL-MB-16MAX",
    name: "MacBook Pro 16 (M4 Max)",
    brand: "Apple",
    category: "Laptop",
    unitPriceUsd: 3499,
    annualUnits: 3_800_000,
    tree: laptopTree({ soc: "soc-m4-max", dram: "dram-lpddr5x-sk", nand: "nand-tlc-sk", panel: "oled-panel-lap14" }),
  },
  {
    sku: "DL-XPS-14",
    name: "Dell XPS 14",
    brand: "Dell",
    category: "Laptop",
    unitPriceUsd: 1499,
    annualUnits: 4_200_000,
    tree: laptopTree({ soc: "cpu-intel-lunar", dram: "dram-lpddr5x-mic", nand: "nand-tlc-mic", panel: "oled-panel-lap14" }),
  },
  {
    sku: "HP-SPEC-X360",
    name: "HP Spectre x360 14",
    brand: "HP",
    category: "Laptop",
    unitPriceUsd: 1349,
    annualUnits: 3_600_000,
    tree: laptopTree({ soc: "cpu-intel-lunar", dram: "dram-lpddr5x-mic", nand: "nand-tlc-mic", panel: "oled-panel-lap14" }),
  },
  {
    sku: "AS-ZEP-G16",
    name: "ASUS ROG Zephyrus G16 (AI 9)",
    brand: "ASUS",
    category: "Laptop",
    unitPriceUsd: 1899,
    annualUnits: 2_400_000,
    tree: laptopTree({ soc: "cpu-amd-hx370", dram: "dram-lpddr5x-sam", nand: "nand-tlc-sk", panel: "oled-panel-lap14" }),
  },
  {
    sku: "APL-IPAD-11M4",
    name: 'iPad Pro 11 (M4)',
    brand: "Apple",
    category: "Tablet",
    unitPriceUsd: 999,
    annualUnits: 12_000_000,
    tree: [
      {
        id: "logic-board",
        name: "Logic Board",
        children: [{ id: "compute", name: "Compute Cluster", comps: ["soc-m4-pro", "dram-lpddr5x-sk", "nand-tlc-sk"] }],
        comps: ["pmic-ti", "mlcc-semco", "wifi-murata-6e", "usbc-te"],
      },
      { id: "display", name: "Display Assembly", comps: ["oled-panel-tab13"], assembly: "display-mod-fox" },
      { id: "camera", name: "Camera System", comps: ["cis-main-sony"], assembly: "cam-assembly-fox" },
      { id: "battery", name: "Battery Pack", comps: ["cell-atl-21700"], assembly: "battery-pack-atl" },
    ],
  },
  {
    sku: "SM-TAB-S10U",
    name: "Galaxy Tab S10 Ultra",
    brand: "Samsung",
    category: "Tablet",
    unitPriceUsd: 1199,
    annualUnits: 5_600_000,
    tree: [
      {
        id: "logic-board",
        name: "Logic Board",
        children: [{ id: "compute", name: "Compute Cluster", comps: ["soc-dim-9400", "dram-lpddr5x-sam", "nand-tlc-sk"] }],
        comps: ["pmic-ti", "mlcc-yageo", "wifi-murata-6e", "usbc-molex"],
      },
      { id: "display", name: "Display Assembly", comps: ["oled-panel-tab13"], assembly: "display-mod-boe" },
      { id: "battery", name: "Battery Pack", comps: ["cell-atl-21700"], assembly: "battery-pack-atl" },
    ],
  },
  {
    sku: "APL-WCH-S10",
    name: "Apple Watch Series 10",
    brand: "Apple",
    category: "Wearable",
    unitPriceUsd: 399,
    annualUnits: 32_000_000,
    tree: [
      {
        id: "sip-board",
        name: "System-in-Package Board",
        comps: ["soc-watch-s10", "dram-lpddr5x-sk", "pmic-ti", "barometer-infineon", "imu-bosch", "mlcc-semco"],
      },
      { id: "display", name: "Display Assembly", comps: ["oled-panel-watch"], assembly: "display-mod-fox" },
      { id: "battery", name: "Battery Cell Fitment", comps: ["cell-atl-21700"], assembly: "battery-pack-lux" },
    ],
  },
  {
    sku: "SM-WCH-ULTRA",
    name: "Galaxy Watch Ultra",
    brand: "Samsung",
    category: "Wearable",
    unitPriceUsd: 649,
    annualUnits: 8_500_000,
    tree: [
      {
        id: "sip-board",
        name: "System-in-Package Board",
        comps: ["soc-exynos-w1600", "dram-lpddr5x-sam", "pmic-adi", "imu-st", "barometer-infineon"],
      },
      { id: "display", name: "Display Assembly", comps: ["oled-panel-watch"], assembly: "display-mod-boe" },
      { id: "battery", name: "Battery Cell Fitment", comps: ["cell-atl-21700"], assembly: "battery-pack-atl" },
    ],
  },
  {
    sku: "APL-AUD-APP3",
    name: "AirPods Pro 3",
    brand: "Apple",
    category: "Audio",
    unitPriceUsd: 249,
    annualUnits: 48_000_000,
    tree: [
      { id: "acoustic", name: "Acoustic Assembly", comps: ["speaker-goertek", "audio-cirrus"], assembly: "audio-assy-goertek" },
      { id: "radio", name: "Radio Board", comps: ["uwb-qorvo", "wifi-murata-6e", "mlcc-yageo"] },
      { id: "battery", name: "Micro Battery", comps: ["cell-atl-21700"], assembly: "battery-pack-lux" },
    ],
  },
  {
    sku: "SN-CON-PS5",
    name: "PlayStation 5 Slim",
    brand: "Sony",
    category: "Console",
    unitPriceUsd: 499,
    annualUnits: 18_000_000,
    tree: [
      {
        id: "motherboard",
        name: "Motherboard Assembly",
        children: [{ id: "apu", name: "APU Complex", comps: ["apu-ps5", "dram-ddr5-sk", "nand-tlc-sk"] }],
        comps: ["slp-board-zdt", "pmic-ti", "mlcc-semco", "usbc-te"],
      },
      { id: "cooling", name: "Cooling Solution", comps: ["vapor-chamber-avc"] },
      { id: "power", name: "Internal PSU", comps: ["al-poly-cap", "psu-hotswap-analog"] },
    ],
  },
  {
    sku: "MS-CON-XSX",
    name: "Xbox Series X",
    brand: "Microsoft",
    category: "Console",
    unitPriceUsd: 499,
    annualUnits: 9_000_000,
    tree: [
      {
        id: "motherboard",
        name: "Motherboard Assembly",
        children: [{ id: "apu", name: "APU Complex", comps: ["apu-xbox", "dram-ddr5-mic", "nand-tlc-mic"] }],
        comps: ["slp-board-zdt", "pmic-ti", "mlcc-yageo", "usbc-molex"],
      },
      { id: "cooling", name: "Cooling Solution", comps: ["vapor-chamber-avc"] },
    ],
  },
  {
    sku: "NT-CON-SW2",
    name: "Nintendo Switch 2",
    brand: "Nintendo",
    category: "Console",
    unitPriceUsd: 449,
    annualUnits: 16_000_000,
    tree: [
      {
        id: "board",
        name: "Main Board",
        children: [{ id: "compute", name: "Compute", comps: ["soc-switch2", "dram-lpddr5x-mic", "nand-tlc-mic"] }],
        comps: ["pmic-ti", "wifi-murata-6e", "mlcc-semco"],
      },
      { id: "display", name: "Display Assembly", comps: ["oled-switch"], assembly: "display-mod-fox" },
      { id: "joycon", name: "Controller Boards", comps: ["mcu-stm32h7", "imu-st"] },
    ],
  },
  {
    sku: "NVD-AI-NVL72",
    name: "GB200 NVL72 Rack System",
    brand: "NVIDIA",
    category: "AI System",
    unitPriceUsd: 3_100_000,
    annualUnits: 4_200,
    tree: aiSystemTree({
      gpu: "gpu-b200",
      hbm: "hbm3e-sk",
      dram: "dram-ddr5-sk",
      cpu: "cpu-xeon-gr",
      switch: "asic-switch-th5",
      rackAssembly: "server-rack-fox",
    }),
  },
  {
    sku: "NVD-AI-HGX100",
    name: "HGX H100 8-GPU Server",
    brand: "NVIDIA",
    category: "AI System",
    unitPriceUsd: 320_000,
    annualUnits: 61_000,
    tree: aiSystemTree({
      gpu: "gpu-h100",
      hbm: "hbm3e-sk",
      dram: "dram-ddr5-mic",
      cpu: "cpu-xeon-gr",
      rackAssembly: "server-rack-jabil",
    }),
  },
  {
    sku: "AMD-AI-MI300X",
    name: "MI300X 8-GPU Server Platform",
    brand: "AMD",
    category: "AI System",
    unitPriceUsd: 295_000,
    annualUnits: 27_000,
    tree: aiSystemTree({
      gpu: "gpu-mi300x",
      hbm: "hbm3e-mic",
      dram: "dram-ddr5-mic",
      cpu: "cpu-epyc-turin",
      rackAssembly: "server-rack-jabil",
    }),
  },
  {
    sku: "GO-AI-TPUV5P",
    name: "TPU v5p Pod Node",
    brand: "Google",
    category: "AI System",
    unitPriceUsd: 240_000,
    annualUnits: 33_000,
    tree: aiSystemTree({
      gpu: "tpu-v5p",
      hbm: "hbm3e-sk",
      dram: "dram-ddr5-sk",
      cpu: "cpu-epyc-turin",
      rackAssembly: "server-rack-fox",
    }),
  },
  {
    sku: "AMZ-AI-TRN2",
    name: "Trainium2 UltraServer",
    brand: "Amazon Web Services",
    category: "AI System",
    unitPriceUsd: 410_000,
    annualUnits: 12_000,
    tree: aiSystemTree({
      gpu: "trainium2",
      hbm: "hbm3e-mic",
      dram: "dram-ddr5-sk",
      cpu: "cpu-xeon-gr",
      rackAssembly: "server-rack-fox",
    }),
  },
  {
    sku: "TS-EV-M3H",
    name: "Tesla Model 3 Highland",
    brand: "Tesla",
    category: "EV",
    unitPriceUsd: 42_490,
    annualUnits: 720_000,
    tree: evTree({ adas: "soc-fsd-hw4", cell: "cell-catl-prismatic", cluster: "cluster-oled-auto" }),
  },
  {
    sku: "TS-EV-MYJ",
    name: "Tesla Model Y Juniper",
    brand: "Tesla",
    category: "EV",
    unitPriceUsd: 46_990,
    annualUnits: 980_000,
    tree: evTree({ adas: "soc-fsd-hw4", cell: "cell-lges", cluster: "cluster-oled-auto" }),
  },
  {
    sku: "HY-EV-IONIQ5",
    name: "Hyundai IONIQ 5 (2026)",
    brand: "Hyundai",
    category: "EV",
    unitPriceUsd: 43_975,
    annualUnits: 310_000,
    tree: evTree({ adas: "soc-eyeq6h", cell: "cell-lges", cluster: "cluster-oled-auto" }),
  },
  {
    sku: "BY-EV-SEAL",
    name: "BYD Seal",
    brand: "BYD",
    category: "EV",
    unitPriceUsd: 32_800,
    annualUnits: 420_000,
    tree: evTree({ adas: "soc-eyeq6h", cell: "cell-catl-prismatic", cluster: "cluster-oled-auto" }),
  },
  {
    sku: "RI-EV-R1T",
    name: "Rivian R1T",
    brand: "Rivian",
    category: "EV",
    unitPriceUsd: 69_900,
    annualUnits: 68_000,
    tree: evTree({ adas: "soc-eyeq6h", cell: "cell-lges", cluster: "cluster-oled-auto" }),
  },
  {
    sku: "CS-NET-CAT9300",
    name: "Catalyst 9300 Access Switch",
    brand: "Cisco",
    category: "Networking",
    unitPriceUsd: 6_800,
    annualUnits: 890_000,
    tree: [
      {
        id: "line-card",
        name: "Line Card Assembly",
        comps: ["asic-switch-th5", "dram-ddr5-mic", "nand-tlc-mic", "psu-hotswap-analog", "mlcc-semco", "b2b-hirose"],
      },
      { id: "chassis", name: "Chassis & PSU Bay", comps: ["al-poly-cap", "usbc-te"], assembly: "harness-fox" },
    ],
  },
  {
    sku: "AR-IND-CTRL7",
    name: "Industrial Edge Controller v7",
    brand: "Arlington Controls",
    category: "Networking",
    unitPriceUsd: 1_250,
    annualUnits: 240_000,
    tree: [
      {
        id: "control-board",
        name: "Control Board",
        comps: ["fpga-zynq", "mcu-stm32h7", "dram-ddr5-mic", "pmic-ti", "can-transceiver-infineon", "esd-array-kyocera"],
      },
      { id: "io-module", name: "IO Expansion Module", comps: ["b2b-kyocera", "current-hall-lem"] },
    ],
  },
];

"use strict";

/**
 * SpectaQL dynamic example generator for Zappie APIs.
 *
 * SpectaQL calls this function for every Scalar, Field, InputField, and
 * Argument it encounters. Return a value to override the default placeholder,
 * or return `undefined` to let SpectaQL generate one itself.
 *
 * Docs: https://github.com/anvilco/spectaql#dynamic-example-generators
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const uuid = () => "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const pastDate = () => "2025-06-15T10:30:00Z";
const futureDate = () => "2026-03-01T00:00:00Z";
const cursor = () => "eyJpZCI6IjEyMyJ9";

/** Match a field/arg name against a list of substrings (case-insensitive). */
function nameIncludes(name, ...terms) {
  const lower = name.toLowerCase();
  return terms.some((t) => lower.includes(t.toLowerCase()));
}

/** Match a field/arg name exactly against a set (case-insensitive). */
function nameIs(name, ...terms) {
  const lower = name.toLowerCase();
  return terms.some((t) => lower === t.toLowerCase());
}

// ---------------------------------------------------------------------------
// Per-scalar defaults
// ---------------------------------------------------------------------------

const SCALAR_EXAMPLES = {
  ID: uuid(),
  String: "string",
  Int: 1,
  Float: 1.5,
  Boolean: true,
  Time: pastDate(),
  Cursor: cursor(),
  Map: { key: "value" },
  Any: "value",
  Upload: null,
  RateInput: "1.5",
};

// ---------------------------------------------------------------------------
// Field-name → example value map
// Matched by checking whether the field name *includes* the key (lower-case).
// Order matters: more-specific entries should come first.
// ---------------------------------------------------------------------------

const STRING_FIELD_HINTS = [
  // Identifiers
  ["businessid", uuid()],
  ["branchid", uuid()],
  ["memberid", uuid()],
  ["customerid", uuid()],
  ["orderid", uuid()],
  ["productid", uuid()],
  ["categoryid", uuid()],
  ["menuid", uuid()],
  ["addonid", uuid()],
  ["paymentid", uuid()],
  ["transactionid", uuid()],
  ["roleid", uuid()],
  ["userid", uuid()],
  ["terminalid", uuid()],
  ["salespointid", uuid()],
  ["salepointid", uuid()],
  ["inventoryid", uuid()],
  ["beaconid", uuid()],
  ["promoid", uuid()],
  ["couponid", uuid()],
  ["discountid", uuid()],
  ["settlementid", uuid()],
  ["payoutid", uuid()],
  ["bankid", uuid()],
  ["sessionid", uuid()],
  ["stocktransferid", uuid()],
  ["unitofmeasureid", uuid()],
  // Generic id / uuid suffix
  ["id", uuid()],

  // Auth / tokens
  [
    "token",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyJ9.SflKxwRJSMeKKF2QT4fwpMeJf36P",
  ],
  ["password", "P@ssw0rd!"],
  ["passcode", "123456"],
  ["pin", "1234"],
  ["otp", "482931"],
  ["activationtoken", "ACT-7X9K2M"],
  ["refreshtoken", "rt_8f3h2k9d"],
  ["accesstoken", "at_9j4k2m8n"],

  // Contact
  ["email", "merchant@example.com"],
  ["phone", "+2348012345678"],
  ["mobile", "+2348012345678"],

  // Names
  ["firstname", "Chukwuemeka"],
  ["lastname", "Adeyemi"],
  ["fullname", "Chukwuemeka Adeyemi"],
  ["businessname", "Mama Chidi Kitchen"],
  ["branchname", "Victoria Island Branch"],
  ["merchantname", "Mama Chidi Kitchen"],
  ["username", "merchant_user"],
  ["displayname", "Mama Chidi"],

  // Address / location
  ["formattedaddress", "14 Admiralty Way, Lekki Phase 1, Lagos"],
  ["address", "14 Admiralty Way, Lekki Phase 1, Lagos"],
  ["city", "Lagos"],
  ["state", "Lagos"],
  ["country", "NG"],
  ["landmark", "Near Lekki Toll Gate"],
  ["placeid", "ChIJLWaonZDLOxARphKnHljkXSo"],
  ["latitude", 6.4281],
  ["longitude", 3.4219],
  ["location", "6.4281,3.4219"],
  ["zipcode", "100001"],
  ["postalcode", "100001"],

  // Finance / payments
  ["accountnumber", "0123456789"],
  ["accountname", "MAMA CHIDI KITCHEN"],
  ["accounttype", "savings"],
  ["bankname", "First Bank"],
  ["bankslug", "first-bank"],
  ["bankcode", "011"],
  ["nuban", "0123456789"],
  ["currency", "NGN"],
  ["amount", 250000],
  ["price", 120000],
  ["subtotal", 370000],
  ["total", 420000],
  ["fee", 15000],
  ["vat", 21000],
  ["balance", 1500000],
  ["rate", 1550.5],
  ["discount", 50000],
  ["markup", 10000],
  ["tip", 5000],
  ["cashreceived", 500000],
  ["change", 80000],
  ["narration", "Payment for order #ORD-2025-001"],
  ["reference", "REF-20250615-001"],
  ["rrn", "251106123456"],
  ["stan", "000001"],
  ["tid", "TID0001234"],
  ["maskedpan", "411111******1111"],
  ["pan", "4111111111111111"],
  ["cvv", "123"],
  ["expiry", "12/27"],
  ["scheme", "VISA"],

  // Order / product
  ["orderreference", "ORD-2025-001"],
  ["quantity", 2],
  ["sku", "SKU-JOLLOF-001"],
  ["barcode", "5901234123457"],
  ["unit", "pcs"],
  ["category", "Nigerian Dishes"],
  ["description", "A delicious plate of Jollof rice with grilled chicken"],
  ["instructions", "Extra spicy, no onions"],
  ["note", "Please call on arrival"],
  ["notes", "Customer allergic to nuts"],

  // Status / type
  ["status", "ACTIVE"],
  ["type", "DELIVERY"],
  ["method", "CARD"],
  ["provider", "PAYSTACK"],
  ["channel", "POS"],
  ["source", "MOBILE"],

  // Dates / time
  ["createdat", pastDate()],
  ["updatedat", pastDate()],
  ["deletedat", pastDate()],
  ["scheduledat", futureDate()],
  ["startsat", futureDate()],
  ["endsat", futureDate()],
  ["expiresat", futureDate()],
  ["completedat", pastDate()],
  ["acceptedat", pastDate()],
  ["rejectedat", pastDate()],
  ["paidat", pastDate()],
  ["settledat", pastDate()],
  ["date", "2025-06-15"],
  ["time", "10:30:00"],

  // Booleans (string-typed)
  ["enabled", true],
  ["disabled", false],
  ["active", true],
  ["available", true],
  ["visible", true],
  ["hidden", false],
  ["required", true],
  ["mutable", true],
  ["static", false],

  // Pagination / sorting
  ["cursor", cursor()],
  ["after", cursor()],
  ["before", cursor()],
  ["first", 10],
  ["last", 10],
  ["page", 1],
  ["limit", 20],
  ["offset", 0],
  ["search", "jollof"],
  ["query", "jollof rice"],
  ["sort", "CREATED_AT"],
  ["direction", "DESC"],

  // Misc
  ["slug", "mama-chidi-kitchen"],
  ["code", "SAVE20"],
  ["url", "https://api.zappie.com"],
  ["imageurl", "https://cdn.zappie.com/images/item.jpg"],
  ["thumbnail", "https://cdn.zappie.com/images/thumb.jpg"],
  ["logo", "https://cdn.zappie.com/logos/business.png"],
  ["icon", "https://cdn.zappie.com/icons/category.svg"],
  ["color", "#FF6B35"],
  ["version", "1.0.0"],
  ["appversion", "2.4.1"],
  ["platform", "ios"],
  ["os", "iOS"],
  ["osversion", "17.2"],
  ["brand", "Apple"],
  ["model", "iPhone 15"],
  ["manufacturer", "Apple Inc."],
  ["serialnumber", "SN-ABC123XYZ"],
  ["deviceid", "device_a1b2c3d4"],
  ["devicename", "iPhone 15 Pro"],
  ["ipaddress", "192.168.1.100"],
  ["useragent", "Zappie/2.4.1 iOS/17.2"],
  ["fcmtoken", "fCm_1a2b3c4d5e6f"],
  ["message", "Operation completed successfully"],
  ["error", "INVALID_INPUT"],
  ["reason", "Payment declined by bank"],
  ["title", "Zappie Merchant"],
  ["name", "Jollof Rice"],
  ["label", "Main Menu"],
  ["tag", "bestseller"],
  ["group", "FOOD"],
  ["role", "CASHIER"],
  ["permission", "DASHBOARD_ORDERS_VIEW"],
  ["scope", "merchant"],
  ["actor", "merchant_user"],
  ["action", "CREATE"],
  ["value", "100"],
];

// ---------------------------------------------------------------------------
// Int field hints
// ---------------------------------------------------------------------------

const INT_FIELD_HINTS = [
  ["amount", 250000],
  ["price", 120000],
  ["total", 420000],
  ["subtotal", 370000],
  ["fee", 15000],
  ["vat", 21000],
  ["balance", 1500000],
  ["discount", 50000],
  ["tip", 5000],
  ["quantity", 2],
  ["count", 5],
  ["limit", 20],
  ["offset", 0],
  ["page", 1],
  ["first", 10],
  ["last", 10],
  ["min", 1],
  ["max", 100],
  ["minimum", 100],
  ["maximum", 50000],
  ["stock", 50],
  ["cap", 10],
  ["duration", 30],
  ["timeout", 60],
  ["retry", 3],
];

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

module.exports = function generator({
  type,
  field,
  arg,
  inputField,
  underlyingType,
  isArray,
}) {
  const thing = arg || inputField || field;
  const thingName = thing ? thing.name : type ? type.name : "";
  const typeName = underlyingType ? underlyingType.name : "";
  const typeKind = underlyingType ? underlyingType.kind : "";

  // Don't override if an example is already set
  if (thing && typeof thing.example !== "undefined") return;
  if (!thing && type && typeof type.example !== "undefined") return;

  // ------------------------------------------------------------------
  // Scalars (type-level, i.e. the scalar itself not a field of that type)
  // ------------------------------------------------------------------
  if (!thing && type && typeKind !== "OBJECT") {
    const ex = SCALAR_EXAMPLES[type.name];
    if (ex !== undefined) return isArray ? [ex] : ex;
    return;
  }

  // ------------------------------------------------------------------
  // Fields, InputFields, Arguments — resolve by type then by name
  // ------------------------------------------------------------------
  if (!thing) return;

  // Scalar type — pick a smart default based on the field name
  if (typeKind === "SCALAR") {
    // Time
    if (typeName === "Time") {
      const ex = nameIncludes(
        thingName,
        "expir",
        "schedule",
        "start",
        "end",
        "due",
        "target",
        "future",
      )
        ? futureDate()
        : pastDate();
      return isArray ? [ex] : ex;
    }

    // Cursor
    if (typeName === "Cursor") {
      const ex = cursor();
      return isArray ? [ex] : ex;
    }

    // Map / Any
    if (typeName === "Map" || typeName === "Any") {
      const ex = { key: "value" };
      return isArray ? [ex] : ex;
    }

    // Upload — skip
    if (typeName === "Upload") return;

    // ID
    if (typeName === "ID") {
      const ex = uuid();
      return isArray ? [ex] : ex;
    }

    // Boolean
    if (typeName === "Boolean") {
      const falseNames = [
        "disabled",
        "hidden",
        "deleted",
        "inactive",
        "failed",
        "rejected",
        "voided",
        "silent",
        "static",
        "isolated",
      ];
      const ex = falseNames.some((n) => nameIncludes(thingName, n))
        ? false
        : true;
      return isArray ? [ex] : ex;
    }

    // Int — check name hints first
    if (typeName === "Int") {
      for (const [hint, val] of INT_FIELD_HINTS) {
        if (nameIncludes(thingName, hint)) {
          return isArray ? [val] : val;
        }
      }
      return isArray ? [1] : 1;
    }

    // Float
    if (typeName === "Float") {
      if (nameIncludes(thingName, "lat")) return isArray ? [6.4281] : 6.4281;
      if (nameIncludes(thingName, "lon", "lng"))
        return isArray ? [3.4219] : 3.4219;
      if (nameIncludes(thingName, "rate", "percent", "factor", "ratio"))
        return isArray ? [1.5] : 1.5;
      if (nameIncludes(thingName, "amount", "price", "total", "fee", "balance"))
        return isArray ? [250000.0] : 250000.0;
      if (nameIncludes(thingName, "quantity", "count", "weight"))
        return isArray ? [2.0] : 2.0;
      return isArray ? [1.5] : 1.5;
    }

    // String — walk the name hint table
    if (typeName === "String" || typeName === "RateInput") {
      for (const [hint, val] of STRING_FIELD_HINTS) {
        if (nameIncludes(thingName, hint)) {
          return isArray ? [val] : val;
        }
      }
      // Fallback: return a capitalised version of the field name
      const fallback = thingName.charAt(0).toUpperCase() + thingName.slice(1);
      return isArray ? [fallback] : fallback;
    }
  }

  // ENUM — return undefined and let SpectaQL pick the first value
  if (typeKind === "ENUM") return;

  return;
};

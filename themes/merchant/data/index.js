"use strict";
// THIS IS AN EXPERIMENTAL API AND IT COULD CHANGE AT ANY TIME IN A BREAKING
// MANNER BEFORE A MAJOR RELEASE. USE AT YOUR OWN RISK.
const { Microfiber: IntrospectionManipulator } = require("microfiber");

// ---------------------------------------------------------------------------
// Group definitions — order determines sidebar order.
// Each entry lists the exact operation names (query or mutation) to include.
// Any operation not listed here falls into "Other" at the bottom.
// ---------------------------------------------------------------------------
const GROUPS = [
  {
    name: "Authentication & Sessions",
    operations: [
      "checkAppVersion",
      "sessions",
      "validatePasswordResetToken",
      "dashboardLogin",
      "dashboardLogout",
      "requestPasswordReset",
      "resetPassword",
      "updateSelf",
      "salePointPasscodeLoginV2",
      "authenticateSalepoint",
      "activateSalepoint",
      "generateSalepointActivationToken",
      "sessionEnd",
      "sessionEndAll",
      "sessionExchange",
      "registerPushNotificationToken",
    ],
  },
  {
    name: "Business & Branches",
    operations: [
      "business",
      "businessBranch",
      "createBusiness",
      "updateBusiness",
      "createBusinessBranch",
      "updateBusinessBranch",
      "updateBranchDeliveryConfig",
    ],
  },
  {
    name: "Team & Permissions",
    operations: [
      "businessMember",
      "businessMembers",
      "members",
      "teamMembers",
      "invite",
      "invites",
      "roles",
      "permissions",
      "permissionsV2",
      "sendInvite",
      "cancelInvite",
      "acceptInvite",
      "createRole",
      "updateRole",
      "deleteRole",
      "createBusinessUser",
      "updateBusinessUser",
    ],
  },
  {
    name: "Menu & Products",
    operations: [
      "menus",
      "menu",
      "menuCategories",
      "menuCategory",
      "products",
      "product",
      "productCategories",
      "productCategory",
      "productAddons",
      "productAddon",
      "createMenu",
      "updateMenu",
      "deleteMenu",
      "syncMenu",
      "syncBranchProducts",
      "createMenuCategory",
      "updateMenuCategory",
      "bulkUpdateMenuCategories",
      "deleteMenuCategory",
      "createProduct",
      "updateProduct",
      "bulkUpdateProducts",
      "deleteProduct",
      "bulkImportProducts",
      "createProductCategory",
      "updateProductCategory",
      "deleteProductCategory",
      "createAddon",
      "updateAddon",
      "deleteAddon",
      "convertAddonToAttribute",
    ],
  },
  {
    name: "Inventory",
    operations: [
      "productInventories",
      "inventoryCount",
      "inventoryCounts",
      "inventoryAdjustments",
      "inventoryTransactions",
      "stockTransfer",
      "stockTransfers",
      "createInventoryCount",
      "startInventoryCount",
      "recordCountItem",
      "applyInventoryCount",
      "approveInventoryCount",
      "cancelInventoryCount",
      "completeInventoryCount",
      "addProductInventory",
      "removeProductInventory",
      "updateInventoryItem",
      "createStockTransfer",
      "requestStockTransfer",
      "approveStockTransfer",
      "rejectStockTransfer",
      "shipStockTransfer",
      "receiveStockTransfer",
      "cancelStockTransfer",
    ],
  },
  {
    name: "Orders",
    operations: [
      "deliveryOrders",
      "deliveryOrder",
      "pendingDeliveryOrders",
      "completedDeliveryOrders",
      "rejectedDeliveryOrders",
      "scheduledDeliveryOrders",
      "staleDeliveryOrders",
      "dineInOrders",
      "dineInOrder",
      "staleDineinOrders",
      "rideBookings",
      "rideBooking",
      "deliveryOrderStatusDescriptors",
      "deliveryOrderScorecard",
      "orderScoreCard",
      "staleOrderInfo",
      "deliveryProviders",
      "deliveryRegions",
      "createDeliveryOrder",
      "updateDeliveryOrder",
      "updateDeliveryOrderStatusV2",
      "bulkCompleteDeliveryOrders",
      "bulkRejectDeliveryOrders",
      "createFrozenDeliveryOrder",
      "shareBankTransferDetailsForFrozenDeliveryOrder",
      "sharePaymentLinkForFrozenDeliveryOrder",
      "createDineInOrder",
      "updateDineInOrder",
      "closeDineInOrder",
      "voidDineInOrder",
      "bulkVoidDineInOrders",
      "bulkVoidUnclosedDineInOrders",
      "layawayDineInOrder",
      "syncDineInOrder",
      "createRideBooking",
      "cancelRideBooking",
      "syncDeliveryRegions",
      "createFrozenDineInOrder",
    ],
  },
  {
    name: "Payments",
    operations: [
      "payments",
      "payment",
      "paymentRefund",
      "refund",
      "externalPaymentMethods",
      "storeCreditTotal",
      "orderCharges",
      "attachPayment",
      "createDeliveryOrderPaymentRequest",
      "createDineInOrderPayment",
      "createPaymentWithAmount",
      "payWithBankTransfer",
      "payWithExternalMethod",
      "payWithStoreCredit",
      "payWithZap",
      "terminalTransactionV2",
      "createStoreCreditPayment",
      "sendStoreCreditTopUpLink",
      "updateCustomerStoreCreditSettings",
      "createExternalPaymentMethod",
      "deleteExternalPaymentMethod",
      "createOrderCharge",
      "updateOrderCharge",
      "deleteOrderCharge",
      "uploadPOSAuditBatch",
    ],
  },
  {
    name: "Payouts & Finance",
    operations: [
      "payouts",
      "payoutDestinations",
      "settlements",
      "settlement",
      "businessTransactions",
      "businessBalances",
      "branchBalance",
      "virtualAccounts",
      "salepointVirtualAccount",
      "initiatePayout",
      "createNUBANPayoutDestination",
      "createSalepointVirtualAccount",
      "releaseVirtualAccount",
    ],
  },
  {
    name: "Customers",
    operations: [
      "customers",
      "customer",
      "getCustomerCart",
      "createCustomer",
      "updateCustomer",
    ],
  },
  {
    name: "Discounts & Promos",
    operations: [
      "discounts",
      "discount",
      "promoCodes",
      "promoCode",
      "createDiscount",
      "updateDiscount",
      "deleteDiscount",
      "createPromo",
      "updatePromo",
      "deletePromo",
    ],
  },
  {
    name: "Integrations",
    operations: [
      "isChowdeckConnected",
      "chowdeckBalance",
      "chowdeckStores",
      "myCloudRooms",
      "searchMyCloudAccounts",
      "whatsappGroups",
      "connectChowdeck",
      "disconnectChowdeck",
      "selectChowdeckStore",
      "connectMyCloud",
      "disconnectMyCloud",
      "postBillToMyCloudRoom",
      "postBillToMyCloudNonRoom",
      "linkWhatsapp",
      "unlinkWhatsapp",
    ],
  },
  {
    name: "Beacons & Pay Points",
    operations: [
      "beacons",
      "beacon",
      "payPoints",
      "payPoint",
      "createBeacon",
      "updateBeacon",
      "deleteBeacon",
      "addBeaconLink",
      "updateBeaconLink",
      "deleteBeaconLink",
      "createPayPoint",
      "deletePayPoint",
      "clearPayPoint",
    ],
  },
  {
    name: "Point of Sale",
    operations: [
      "salePoint",
      "salePoints",
      "salePointConfig",
      "getTerminalInfo",
      "createSalePointConfig",
      "updateSalePointConfig",
      "deleteSalePointConfig",
      "mapTerminal",
    ],
  },
  {
    name: "Printers",
    operations: [
      "printers",
      "printer",
      "printStations",
      "printStation",
      "createPrinter",
      "updatePrinter",
      "deletePrinter",
      "createPrintStation",
      "updatePrintStation",
      "deletePrintStation",
      "assignPrinterToPrintStation",
      "setPrintStationForCategoryProducts",
      "setPrintStationForMenuProducts",
    ],
  },
  {
    name: "Analytics",
    operations: ["productSales", "auditLogs"],
  },
  {
    name: "Utilities",
    operations: [
      "banks",
      "generateUSSD",
      "resolveNubanAccount",
      "node",
      "nodes",
    ],
  },
];

// ---------------------------------------------------------------------------

function sortByName(a, b) {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

module.exports = ({ introspectionResponse, introspectionOptions }) => {
  const manipulator = new IntrospectionManipulator(
    introspectionResponse,
    introspectionOptions?.microfiberOptions,
  );

  const queryType = manipulator.getQueryType();
  const mutationType = manipulator.getMutationType();
  const otherTypes = manipulator.getAllTypes({
    includeQuery: false,
    includeMutation: false,
    includeSubscription: false,
  });

  const queryFields = (queryType && queryType.fields) || [];
  const mutationFields = (mutationType && mutationType.fields) || [];

  // Track which operation names have been placed into a group
  const placed = new Set();

  // Build operation lookup maps
  const queryMap = new Map(queryFields.map((f) => [f.name, f]));
  const mutationMap = new Map(mutationFields.map((f) => [f.name, f]));

  // Build the grouped sections
  const groupedSections = GROUPS.map((group) => {
    const items = [];
    for (const name of group.operations) {
      if (queryMap.has(name)) {
        items.push({ ...queryMap.get(name), isQuery: true });
        placed.add(`query:${name}`);
      }
      if (mutationMap.has(name)) {
        items.push({ ...mutationMap.get(name), isMutation: true });
        placed.add(`mutation:${name}`);
      }
    }
    if (!items.length) return null;
    return {
      name: group.name,
      makeNavSection: true,
      makeContentSection: true,
      items: items.sort(sortByName),
    };
  }).filter(Boolean);

  // Collect any operations not explicitly placed (excluding _empty stub)
  const unplaced = [];
  for (const f of queryFields) {
    if (!placed.has(`query:${f.name}`) && f.name !== "_empty") {
      unplaced.push({ ...f, isQuery: true });
    }
  }
  for (const f of mutationFields) {
    if (!placed.has(`mutation:${f.name}`) && f.name !== "_empty") {
      unplaced.push({ ...f, isMutation: true });
    }
  }
  if (unplaced.length) {
    groupedSections.push({
      name: "Other",
      makeNavSection: true,
      makeContentSection: true,
      items: unplaced.sort(sortByName),
    });
  }

  return [
    {
      name: "Operations",
      hideInContent: true,
      items: groupedSections,
    },
    otherTypes && otherTypes.length
      ? {
          name: "Types",
          makeContentSection: true,
          items: otherTypes
            .map((t) => ({ ...t, isType: true }))
            .sort(sortByName),
        }
      : null,
  ].filter(Boolean);
};

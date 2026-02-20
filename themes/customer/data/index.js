'use strict'
const { Microfiber: IntrospectionManipulator } = require('microfiber')

const GROUPS = [
  {
    name: 'Authentication',
    operations: [
      'customer',
      'logoutCustomer',
      'updateCustomer',
      'initiateWebCheckoutLogin',
      'completeWebCheckoutLogin',
    ],
  },
  {
    name: 'Business Discovery',
    operations: [
      'businessByTag',
      'beaconBySlug',
      'businessDynamicVirtualAccount',
    ],
  },
  {
    name: 'Menu & Products',
    operations: [
      'menuGroupById',
      'menuProducts',
      'product',
    ],
  },
  {
    name: 'Orders',
    operations: [
      'deliveryOrder',
      'dineInOrder',
      'deliveryOrderStatusDescriptors',
      'previewDeliveryOrder',
      'previewDineInOrder',
      'createFrozenDeliveryOrder',
      'createDineInOrder',
      'placeDeliveryOrderWithBankTransfer',
      'placeDeliveryOrderWithWallet',
      'createDineInOrderPayment',
    ],
  },
  {
    name: 'Cart',
    operations: [
      'saveCustomerCart',
    ],
  },
  {
    name: 'Payments',
    operations: [
      'payment',
      'paymentRequest',
      'paymentMethods',
      'creditCards',
      'customerCardTransaction',
      'generateUSSD',
      'addCreditCard',
      'deleteCreditCard',
      'authorizeCardOTP',
      'authorizeCardPIN',
      'payWithCard',
      'payWithSavedCard',
      'payWithWallet',
      'payWithZap',
      'payWithBankTransfer',
      'cancelBankTransfer',
      'createPaymentFromDeliveryOrder',
      'requestToPayWithPOS',
      'createApplePayRequest',
    ],
  },
  {
    name: 'Wallet & Transactions',
    operations: [
      'refunds',
      'transactions',
      'initiatePayout',
      'createNUBANPayoutDestination',
      'createCustomerVirtualAccount',
    ],
  },
  {
    name: 'Addresses & Delivery',
    operations: [
      'deliveryRegions',
      'payPoint',
      'createDeliveryAddress',
      'removeDeliveryAddress',
    ],
  },
  {
    name: 'Utilities',
    operations: [
      'banks',
      'resolveNubanAccount',
      'node',
      'nodes',
    ],
  },
]

function sortByName(a, b) {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
}

module.exports = ({
  introspectionResponse,
  introspectionOptions,
}) => {
  const manipulator = new IntrospectionManipulator(
    introspectionResponse,
    introspectionOptions?.microfiberOptions,
  )

  const queryType = manipulator.getQueryType()
  const mutationType = manipulator.getMutationType()
  const otherTypes = manipulator.getAllTypes({
    includeQuery: false,
    includeMutation: false,
    includeSubscription: false,
  })

  const queryFields = (queryType && queryType.fields) || []
  const mutationFields = (mutationType && mutationType.fields) || []

  const placed = new Set()
  const queryMap = new Map(queryFields.map((f) => [f.name, f]))
  const mutationMap = new Map(mutationFields.map((f) => [f.name, f]))

  const groupedSections = GROUPS.map((group) => {
    const items = []
    for (const name of group.operations) {
      if (queryMap.has(name)) {
        items.push({ ...queryMap.get(name), isQuery: true })
        placed.add(`query:${name}`)
      }
      if (mutationMap.has(name)) {
        items.push({ ...mutationMap.get(name), isMutation: true })
        placed.add(`mutation:${name}`)
      }
    }
    if (!items.length) return null
    return {
      name: group.name,
      makeNavSection: true,
      makeContentSection: true,
      items: items.sort(sortByName),
    }
  }).filter(Boolean)

  const unplaced = []
  for (const f of queryFields) {
    if (!placed.has(`query:${f.name}`) && f.name !== '_empty') {
      unplaced.push({ ...f, isQuery: true })
    }
  }
  for (const f of mutationFields) {
    if (!placed.has(`mutation:${f.name}`) && f.name !== '_empty') {
      unplaced.push({ ...f, isMutation: true })
    }
  }
  if (unplaced.length) {
    groupedSections.push({
      name: 'Other',
      makeNavSection: true,
      makeContentSection: true,
      items: unplaced.sort(sortByName),
    })
  }

  return [
    {
      name: 'Operations',
      hideInContent: true,
      items: groupedSections,
    },
    otherTypes && otherTypes.length
      ? {
          name: 'Types',
          makeContentSection: true,
          items: otherTypes
            .map((t) => ({ ...t, isType: true }))
            .sort(sortByName),
        }
      : null,
  ].filter(Boolean)
}

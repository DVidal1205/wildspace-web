export const PLANS = [
    {
        name: "Demo",
        slug: "demo",
        quota: 10,
        price: {
            amount: 0,
            priceIds: {
                test: "",
                production: "",
            },
        },
    },
    {
        name: "Pro",
        slug: "pro",
        quota: 30,
        price: {
            amount: 10,
            priceIds: {
                test: "price_1OcY0aE1PMQSFbMCeSM2bBVB",
                production: "price_1Ocg9ME1PMQSFbMCgfBtDsgQ",
            },
        },
    },
    {
        name: "Premium",
        slug: "premium",
        quota: 40,
        price: {
            amount: 15,
            priceIds: {
                test: "price_1OcZffE1PMQSFbMCG4CVCP9q",
                production: "price_1Ocg8xE1PMQSFbMCutmZc5ma",
            },
        },
    },
];

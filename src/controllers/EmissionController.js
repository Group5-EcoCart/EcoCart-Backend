import axios from "axios";

const getEmissionFactor = (category) => {
    const categoryMap = {
        clothing: "consumer_goods-type_clothing",
        electronics: "consumer_goods-type_consumer_electronics",
        food: "food_and_beverages-type_food",
    };
    return categoryMap[category.toLowerCase()] || "consumer_goods-type_consumer_goods_unspecified";
}

const getCarbonFootprint = async (category, price, region = 'IN') => {
    try {
        const emissionFactor = getEmissionFactor(category);
        try {
            const response = await axios.post(
                'https://api.climatiq.io/data/v1/estimate',
                {
                    emission_factor: {
                        activity_id: emissionFactor,
                        region: region,
                        data_version: "^3"
                    },
                    parameters: {
                        money: price,
                        money_unit: 'inr'
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.CLIMATIQ_API_KEY}`
                    }
                }
            );
            return response.data.co2e;
        } catch (regionError) {
            if (regionError.response?.data?.error_code === 'no_emission_factors_found') {
                const globalResponse = await axios.post(
                    'https://api.climatiq.io/data/v1/estimate',
                    {
                        emission_factor: {
                            activity_id: emissionFactor,
                            data_version: "^3"
                        },
                        parameters: {
                            money: price,
                            money_unit: 'inr'
                        }
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.CLIMATIQ_API_KEY}`
                        }
                    }
                );
                return globalResponse.data.co2e;
            }
            throw regionError;
        }
    } catch (error) {
        console.error("Climatiq API error:", error.response?.data || error.message);
        return null;
    }
}

export default getCarbonFootprint;
import axios from "axios";

const getEmissionFactor = (category) => {
    const categoryMap = {
        // Price-based categories
        clothing: "consumer_goods-type_clothing",
        shoes: "consumer_goods-type_footwear",
        accessories: "consumer_goods-type_accessories",
        jewelry: "consumer_goods-type_jewelry",
        electronics: "consumer_goods-type_consumer_electronics",
        computer: "consumer_goods-type_computers",
        mobile: "consumer_goods-type_mobile_phones",
        appliances: "consumer_goods-type_home_appliances",
        furniture: "consumer_goods-type_furniture",
        home: "consumer_goods-type_home_furnishings",
        kitchen: "consumer_goods-type_kitchen_utensils",
        garden: "consumer_goods-type_garden_products",
        cosmetics: "consumer_goods-type_cosmetics",
        skincare: "consumer_goods-type_personal_care",
        sports: "consumer_goods-type_sporting_goods",
        books: "consumer_goods-type_books",
        stationary: "consumer_goods-type_stationery",
        toys: "consumer_goods-type_toys",
        pet: "consumer_goods-type_pet_supplies",
        health: "consumer_goods-type_health_products",
        other: "consumer_goods-type_consumer_goods_unspecified",
        
        // Mass-based categories (need special handling)
        food: "food_and_beverages-type_food",
        groceries: "food_and_beverages-type_food"
    };
    
    const normalizedCategory = category.toLowerCase().trim();
    return categoryMap[normalizedCategory] || "consumer_goods-type_consumer_goods_unspecified";
}

const getCarbonFootprint = async (category, price, weight = null, region = 'IN') => {
    try {
        const emissionFactor = getEmissionFactor(category);
        const normalizedCategory = category.toLowerCase().trim();

        console.log(`Calculating for: ${category} -> ${emissionFactor}`);

        // Check if this is a mass-based category
        const massBasedCategories = ['food', 'groceries'];
        const isMassBased = massBasedCategories.includes(normalizedCategory);

        let parameters = {};

        if (isMassBased) {
            // Mass-based calculation (food, groceries)
            if (!weight || weight <= 0) {
                console.warn(`Weight required for ${category}, using price fallback`);
                parameters = {
                    money: price,
                    money_unit: 'inr'
                };
            } else {
                parameters = {
                    weight: weight,
                    weight_unit: 'kg'
                };
            }
        } else {
            // Price-based calculation (most consumer goods)
            parameters = {
                money: price,
                money_unit: 'inr'
            };
        }

        console.log(`Using parameters:`, parameters);

        // Try with specified region first
        try {
            const response = await axios.post(
                'https://api.climatiq.io/data/v1/estimate',
                {
                    emission_factor: {
                        activity_id: emissionFactor,
                        region: region,
                        data_version: "^3"
                    },
                    parameters: parameters
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.CLIMATIQ_API_KEY}`
                    },
                    timeout: 10000
                }
            );
            
            console.log(`Carbon footprint calculated: ${response.data.co2e}`);
            return response.data.co2e;
            
        } catch (regionError) {
            if (regionError.response?.data?.error_code === 'no_emission_factors_found') {
                console.log(`Region ${region} not found, trying global...`);
                
                const globalResponse = await axios.post(
                    'https://api.climatiq.io/data/v1/estimate',
                    {
                        emission_factor: {
                            activity_id: emissionFactor,
                            data_version: "^3"
                        },
                        parameters: parameters
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.CLIMATIQ_API_KEY}`
                        },
                        timeout: 10000
                    }
                );
                
                console.log(`Global carbon footprint calculated: ${globalResponse.data.co2e}`);
                return globalResponse.data.co2e;
            }
            throw regionError;
        }
        
    } catch (error) {
        console.error("Climatiq API error:", error.response?.data || error.message);
        
        // Fallback calculation
        return calculateFallbackFootprint(category, price, weight);
    }
}

// Enhanced fallback calculation
const calculateFallbackFootprint = (category, price, weight = null) => {
    const normalizedCategory = category.toLowerCase().trim();
    
    // Mass-based categories (food, groceries)
    const massBasedCategories = ['food', 'groceries'];
    if (massBasedCategories.includes(normalizedCategory)) {
        if (weight && weight > 0) {
            // Average food emissions: 2-4 kg CO2e per kg
            return weight * 3; // 3 kg CO2e per kg as average
        }
        // Fallback to price if no weight
        return (price / 100) * 0.5; // Approx 0.5 kg CO2e per 100 INR
    }
    
    // Price-based categories
    const emissionIntensity = {
        clothing: 0.8, shoes: 1.2, accessories: 0.6, jewelry: 2.5,
        electronics: 3.0, computer: 4.0, mobile: 2.0, appliances: 3.5,
        furniture: 5.0, home: 2.0, kitchen: 1.8, garden: 1.5,
        cosmetics: 2.0, skincare: 1.8, sports: 2.2, books: 0.4,
        stationary: 0.3, toys: 1.0, pet: 1.5, health: 1.8, other: 1.0
    };
    
    const multiplier = emissionIntensity[normalizedCategory] || 1.0;
    return (price / 1000) * multiplier;
}

export default getCarbonFootprint;
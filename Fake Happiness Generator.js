console.log("Starting...");
const DefaultFiveStarProbability = 0.006;
const DefaultFourStarProbability = 0.051; 
const SoftPityStart = 75;
const MaxSoftPity = 0.3;
let GuaranteedFeaturedFiveStar = false;
let GuaranteedFeaturedFourStar = false;
let FiveStarPity = 0;
let FourStarPity = 0;
let pulls = []; // Store all pull results
let summary = { FiveStar: 0, FourStar: 0, ThreeStar: 0 }; // Summary of pulls
async function GetFiveStarProbability() {
    if (FiveStarPity < SoftPityStart) {
        return DefaultFiveStarProbability; 
    }
    const slope = (MaxSoftPity - DefaultFiveStarProbability) / (90 - SoftPityStart);
    return DefaultFiveStarProbability + slope * (FiveStarPity - SoftPityStart);
}

async function GeneratePull() {
    FiveStarPity++;
    FourStarPity++;
    let FiveStarProbability = await GetFiveStarProbability(); // Await the probability
    if (FiveStarPity >= 90) {
        return await GetFiveStar();
    }
    if (FourStarPity >= 10) {
        return await GetFourStar();
    }
    const random = Math.random();
    let CumulativeProbability = 0;
    CumulativeProbability += FiveStarProbability;
    if (random < CumulativeProbability) {
        return await GetFiveStar();
    }
    CumulativeProbability += DefaultFourStarProbability; 
    if (random < CumulativeProbability) {
        return await GetFourStar();
    }
    return await GetThreeStar();
}
async function GetFiveStar() {
    FiveStarPity = 0;
    FourStarPity = 0;
    let IsFeatured = GuaranteedFeaturedFiveStar || Math.random() < 0.5;
    GuaranteedFeaturedFiveStar = !IsFeatured; // Next 5-star is guaranteed if not featured

    return {
        rarity: 5,
        type: IsFeatured ? "Skirk (Featured 5-star Character)" : "Standard 5-star Character",
        FiveStarPity,
        FourStarPity
    };
}
async function GetFourStar() {
    FourStarPity = 0;
    let IsFeatured = GuaranteedFeaturedFourStar || Math.random() < 0.5;
    GuaranteedFeaturedFourStar = !IsFeatured;

    return {
        rarity: 4,
        type: IsFeatured ? "Featured 4-star Character" : "Standard 4-star",
        FiveStarPity,
        FourStarPity
    };
}

async function GetThreeStar() {
    return {
        rarity: 3,
        type: "3-star Weapon",
        FiveStarPity,
        FourStarPity
    };
}
async function GenerateMultiplePulls(num) {
    const results = [];
    for (let i = 0; i < num; i++) {
        const pull = await GeneratePull();
        results.push(pull);
        pulls.push(pull); // Store in global pulls array
    }
    return results;
}
async function GetPityStatus() {
    return {
        FiveStarPity,
        FourStarPity,
        GuaranteedFeaturedFiveStar,
        GuaranteedFeaturedFourStar
    };
}
async function UpdateSummary(pullResults) {
    // Handle both single pull and array of pulls
    const results = Array.isArray(pullResults) ? pullResults : [pullResults];
    results.forEach(pull => {
        if (pull.rarity === 5) summary.FiveStar++;
        else if (pull.rarity === 4) summary.FourStar++;
        else summary.ThreeStar++;
    });
}
async function Summarize() {
    console.log("Pull Results:", pulls);
    console.log("Summary:", summary);
    console.log("Final Pity Status:", await GetPityStatus());
}

// Event listeners for buttons
const SinglePullButton = document.getElementById("1x");
const TenPullButton = document.getElementById("10x");
const SummarizeButton = document.getElementById("Summarize");

if (SinglePullButton) {
    SinglePullButton.addEventListener("click", async () => {
        const pull = await GeneratePull();
        pulls.push(pull); // Store in global pulls
        await UpdateSummary(pull);
        console.log("Single Pull Result:", pull);
    });
} else {
    console.warn("Button with ID '1x' not found.");
}

if (TenPullButton) {
    TenPullButton.addEventListener("click", async () => {
        const pullResults = await GenerateMultiplePulls(10);
        await UpdateSummary(pullResults);
        console.log("10 Pull Results:", pullResults);
    });
} else {
    console.warn("Button with ID '10x' not found.");
}

if (SummarizeButton) {
    SummarizeButton.addEventListener("click", async () => {
        await Summarize();
    });
} else {
    console.warn("Button with ID 'Summarize' not found.");
}

const ResetButton = document.getElementById("reset");
if(ResetButton) {
    ResetButton.addEventListener("click", () => {
        pulls  = [];
        let summary = { FiveStar: 0, FourStar: 0, ThreeStar: 0 };
        FiveStarPity = 0;
        FourStarPity = 0;
        GuaranteedFeaturedFiveStar = false;
        GuaranteedFeaturedFourStar = false;
        console.log("Reset Complete");
    });
}


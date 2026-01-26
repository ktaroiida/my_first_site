import Papa from 'papaparse';

class DataService {
    constructor() {
        this.data = [];
        this.prefectures = [];
        this.years = [];
        this.geoJson = null;
    }

    async init() {
        await Promise.all([
            this.loadCsv(),
            this.loadGeoJson()
        ]);
        this.processData();
    }

    async loadCsv() {
        const response = await fetch(`${import.meta.env.BASE_URL}data/university_data.csv`);
        const reader = response.body.getReader();
        const result = await reader.read();
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result.value);

        return new Promise((resolve) => {
            Papa.parse(csv, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    this.data = results.data;
                    resolve();
                }
            });
        });
    }

    async loadGeoJson() {
        const response = await fetch('https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson');
        this.geoJson = await response.json();
    }

    processData() {
        this.years = [...new Set(this.data.map(d => d.Year))].sort((a, b) => a - b);
        this.prefectures = [...new Set(this.data.map(d => d.Prefecture))];
    }

    // Helper to normalize prefecture names for matching
    normalizePref(name) {
        if (!name) return "";
        return name.replace(/[県府都]$/, "").trim();
    }

    getYearlyData(year) {
        return this.data.filter(d => d.Year === year);
    }

    getPrefectureTrend(prefName) {
        const normalizedInput = this.normalizePref(prefName);
        const trend = this.data
            .filter(d => this.normalizePref(d.Prefecture) === normalizedInput)
            .sort((a, b) => a.Year - b.Year);
        return trend;
    }

    getLatestData(prefName) {
        const trend = this.getPrefectureTrend(prefName);
        return trend.length > 0 ? trend[trend.length - 1] : null;
    }

    getPrefectureRank(year, prefName) {
        const yearlyData = this.getYearlyData(year);
        const normalizedInput = this.normalizePref(prefName);
        const sorted = [...yearlyData].sort((a, b) => (b.Male_Rate + b.Female_Rate) / 2 - (a.Male_Rate + a.Female_Rate) / 2);
        const rank = sorted.findIndex(d => this.normalizePref(d.Prefecture) === normalizedInput) + 1;
        return rank > 0 ? rank : "-";
    }

    getGenderGapRank(year, prefName) {
        const yearlyData = this.getYearlyData(year);
        const normalizedInput = this.normalizePref(prefName);
        // Rank by absolute gap (smaller gap is better? Or just smallest gap is rank 1)
        // Usually people want "smallest gap" to be rank 1.
        const sorted = [...yearlyData].sort((a, b) => Math.abs(a.Male_Rate - a.Female_Rate) - Math.abs(b.Male_Rate - b.Female_Rate));
        const rank = sorted.findIndex(d => this.normalizePref(d.Prefecture) === normalizedInput) + 1;
        return rank > 0 ? rank : "-";
    }
}

export const dataService = new DataService();

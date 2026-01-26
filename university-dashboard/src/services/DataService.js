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
        // Data of Japan GeoJSON
        const response = await fetch('https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson');
        this.geoJson = await response.json();
    }

    processData() {
        this.years = [...new Set(this.data.map(d => d.Year))].sort((a, b) => a - b);
        this.prefectures = [...new Set(this.data.map(d => d.Prefecture))];
    }

    getYearlyData(year) {
        return this.data.filter(d => d.Year === year);
    }

    getPrefectureTrend(prefName) {
        return this.data
            .filter(d => d.Prefecture === prefName)
            .sort((a, b) => a.Year - b.Year);
    }

    getLatestData(prefName) {
        const trend = this.getPrefectureTrend(prefName);
        return trend[trend.length - 1];
    }

    getPrefectureRank(year, prefName) {
        const yearlyData = this.getYearlyData(year);
        const sorted = [...yearlyData].sort((a, b) => (b.Male_Rate + b.Female_Rate) / 2 - (a.Male_Rate + a.Female_Rate) / 2);
        const rank = sorted.findIndex(d => d.Prefecture === prefName) + 1;
        return rank;
    }

    getRateChange(prefName) {
        const trend = this.getPrefectureTrend(prefName);
        if (trend.length < 2) return 0;
        const first = (trend[0].Male_Rate + trend[0].Female_Rate) / 2;
        const last = (trend[trend.length - 1].Male_Rate + trend[trend.length - 1].Female_Rate) / 2;
        return last - first;
    }
}

export const dataService = new DataService();

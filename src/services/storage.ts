import { MasturbationRecord, MasturbationStats } from '../types/record';

const STORAGE_KEY = 'masturbation_records';

export class StorageService {
    static exportData(): string {
        const records = this.getRecords();
        return JSON.stringify(records, null, 2);
    }

    static importData(jsonData: string): boolean {
        try {
            const records = JSON.parse(jsonData);
            if (!Array.isArray(records)) return false;
            
            // 验证数据格式
            const isValid = records.every(record => 
                typeof record.id === 'string' &&
                record.startTime &&
                typeof record.duration === 'number'
            );
            
            if (!isValid) return false;
            
            // 转换日期格式
            const formattedRecords = records.map(record => ({
                ...record,
                startTime: new Date(record.startTime)
            }));
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedRecords));
            return true;
        } catch (error) {
            return false;
        }
    }

    static saveRecord(record: MasturbationRecord): void {
        const records = this.getRecords();
        records.push(record);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }

    static getRecords(): MasturbationRecord[] {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data).map((record: any) => ({
            ...record,
            startTime: new Date(record.startTime)
        }));
    }

    static getStats(): MasturbationStats {
        const records = this.getRecords();
        const now = new Date();
        
        // 计算本周开始时间（过去7天）
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // 计算本月开始时间（当月1号）
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // 计算过去30天的开始时间（用于保持原有的frequencyPerMonth兼容性）
    
        const totalCount = records.length;
        const totalDuration = records.reduce((sum, record) => sum + record.duration, 0);
        const recordsLastWeek = records.filter(record => record.startTime >= oneWeekAgo);
        
        // 修改为使用当月1号作为过滤条件
        const recordsCurrentMonth = records.filter(record => record.startTime >= currentMonthStart);
    
        return {
            totalCount,
            averageDuration: totalCount > 0 ? totalDuration / totalCount : 0,
            frequencyPerWeek: recordsLastWeek.length,
            frequencyPerMonth: recordsCurrentMonth.length
        };
    }

    static deleteRecord(id: string): void {
        const records = this.getRecords();
        const filteredRecords = records.filter(record => record.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords));
    }
}
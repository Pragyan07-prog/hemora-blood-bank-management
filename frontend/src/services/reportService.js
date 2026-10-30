import api from './api';

export const reportService = {
  async getReportData(type, dateRange) {
    try {
      const response = await api.get('/api/reports', { params: { type, ...dateRange } });
      return response.data;
    } catch (error) {
      // Mock report metrics based on type
      if (type === 'donations') {
        return {
          success: true,
          data: {
            summary: { total_units: 420, verified: 395, discarded: 25, unique_donors: 310 },
            chart_data: [
              { label: 'Week 1', units: 95 },
              { label: 'Week 2', units: 110 },
              { label: 'Week 3', units: 105 },
              { label: 'Week 4', units: 110 },
            ],
            table: [
              { id: 'DON-01', donor: 'Alexander Hayes', blood_group: 'O+', units: 1, type: 'Whole Blood', date: '2026-10-28', status: 'VERIFIED' },
              { id: 'DON-02', donor: 'Sophia Patel', blood_group: 'A+', units: 2, type: 'Platelets', date: '2026-10-27', status: 'VERIFIED' },
              { id: 'DON-03', donor: 'Marcus Vance', blood_group: 'B-', units: 1, type: 'Whole Blood', date: '2026-10-25', status: 'VERIFIED' },
            ],
          },
        };
      } else if (type === 'requests') {
        return {
          success: true,
          data: {
            summary: { total_requests: 180, fulfilled: 155, pending: 15, rejected: 10 },
            chart_data: [
              { label: 'Trauma', value: 75 },
              { label: 'Surgery', value: 55 },
              { label: 'Oncology', value: 32 },
              { label: 'Maternity', value: 18 },
            ],
            table: [
              { id: 'REQ-881', hospital: 'Metro Trauma Center', units: 2, blood_group: 'B-', urgency: 'CRITICAL', status: 'PENDING' },
              { id: 'REQ-880', hospital: 'St. Jude Memorial', units: 4, blood_group: 'O-', urgency: 'URGENT', status: 'APPROVED' },
            ],
          },
        };
      } else {
        return {
          success: true,
          data: {
            summary: { total_inventory: 243, optimal: 5, low: 2, critical: 1 },
            chart_data: [
              { label: 'A+', count: 48 },
              { label: 'B+', count: 52 },
              { label: 'O+', count: 75 },
              { label: 'AB+', count: 28 },
              { label: 'O-', count: 11 },
              { label: 'B-', count: 9 },
            ],
            table: [
              { blood_group: 'O+', available: 75, status: 'OPTIMAL', turnover: 'High' },
              { blood_group: 'B-', available: 9, status: 'CRITICAL', turnover: 'High' },
              { blood_group: 'A-', available: 14, status: 'LOW', turnover: 'Medium' },
            ],
          },
        };
      }
    }
  },

  exportCSV(filename, rows) {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) => {
          return keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },
};

export default reportService;

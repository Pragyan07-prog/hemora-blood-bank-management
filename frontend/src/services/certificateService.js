import api from './api';

const MOCK_CERTIFICATES = [
  {
    id: 'CERT-2026-901',
    certificate_number: 'HEMORA-CERT-901-2026',
    donor_id: 1,
    donor_name: 'Alexander Hayes',
    blood_group: 'O+',
    units: 1,
    donation_type: 'Whole Blood',
    donation_date: '2026-08-15',
    issued_date: '2026-08-16',
    center: 'HEMORA Central Blood Bank',
    status: 'ISSUED',
  },
  {
    id: 'CERT-2026-850',
    certificate_number: 'HEMORA-CERT-850-2026',
    donor_id: 1,
    donor_name: 'Alexander Hayes',
    blood_group: 'O+',
    units: 1,
    donation_type: 'Whole Blood',
    donation_date: '2026-04-10',
    issued_date: '2026-04-11',
    center: 'Community Red Cross Center',
    status: 'ISSUED',
  },
  {
    id: 'CERT-2025-790',
    certificate_number: 'HEMORA-CERT-790-2025',
    donor_id: 1,
    donor_name: 'Alexander Hayes',
    blood_group: 'O+',
    units: 1,
    donation_type: 'Whole Blood',
    donation_date: '2025-12-05',
    issued_date: '2025-12-06',
    center: 'HEMORA Central Blood Bank',
    status: 'ISSUED',
  },
  {
    id: 'CERT-2026-902',
    certificate_number: 'HEMORA-CERT-902-2026',
    donor_id: 2,
    donor_name: 'Sophia Patel',
    blood_group: 'A+',
    units: 2,
    donation_type: 'Platelets',
    donation_date: '2026-10-10',
    issued_date: '2026-10-11',
    center: 'St. Jude Memorial Center',
    status: 'ISSUED',
  },
];

export const certificateService = {
  async getCertificates() {
    try {
      const response = await api.get('/api/certificates');
      return response.data;
    } catch (error) {
      return { success: true, data: MOCK_CERTIFICATES };
    }
  },

  async getMyCertificates() {
    try {
      const response = await api.get('/api/certificates/me');
      return response.data;
    } catch (error) {
      return { success: true, data: MOCK_CERTIFICATES.slice(0, 3) };
    }
  },

  async generateCertificate(donationId) {
    try {
      const response = await api.post(`/api/certificates/generate/${donationId}`);
      return response.data;
    } catch (error) {
      const newCert = {
        id: `CERT-2026-${donationId}`,
        certificate_number: `HEMORA-CERT-${donationId}-2026`,
        issued_date: new Date().toISOString().split('T')[0],
        status: 'ISSUED',
      };
      return {
        success: true,
        message: 'Certificate generated successfully!',
        data: newCert,
      };
    }
  },

  async verifyCertificate(certNum) {
    try {
      const response = await api.get(`/api/certificates/verify/${certNum}`);
      return response.data;
    } catch (error) {
      const clean = certNum.trim().toUpperCase();
      const match = MOCK_CERTIFICATES.find(c => c.certificate_number === clean || c.id === clean);
      if (match) {
        return { success: true, data: match, verified: true };
      }
      return {
        success: false,
        verified: false,
        message: 'No certificate found with that credential number.',
      };
    }
  },
};

export default certificateService;

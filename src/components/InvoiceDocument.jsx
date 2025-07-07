import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 40,
    lineHeight: 1.5,
    color: '#333',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    textAlign: 'right',
  },
  orgName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#1a202c',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    borderBottom: '1px solid #eee',
    paddingBottom: 3,
    marginBottom: 8,
  },
  donorInfo: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 3,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '75%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f2f2f2',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  tableColAmountHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f2f2f2',
    padding: 8,
    fontWeight: 'bold',
    textAlign: 'right',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  tableCol: {
    width: '75%',
    padding: 8,
  },
  tableColAmount: {
    width: '25%',
    padding: 8,
    textAlign: 'right',
  },
  totalSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalBox: {
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderLeft: '3px solid #10B981',
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#777',
    borderTop: '1px solid #eee',
    paddingTop: 10,
  },
  thankYou: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
  registrationNumber: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 10,
  },
  textMuted: {
    fontSize: 10,
    color: '#666',
  }
});

const InvoiceDocument = ({ invoice }) => {
  const { org_details, donor_details, invoice_number, issue_date, amount } = invoice;
  
  const isCompany = donor_details.is_company_donation;
  const donorName = isCompany ? donor_details.company_name : `${donor_details.first_name} ${donor_details.last_name}`;
  const donorContact = isCompany ? donor_details.company_address : donor_details.email;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.orgName}>{org_details.org_name}</Text>
            <Text style={styles.textMuted}>{org_details.address}</Text>
            <Text style={styles.textMuted}>{`${org_details.city}, ${org_details.province} ${org_details.postal_code}`}</Text>
            <Text style={styles.textMuted}>{org_details.email}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontWeight: 'bold' }}>Numéro de reçu : {invoice_number}</Text>
            <Text style={styles.textMuted}>Date d'émission : {new Date(issue_date).toLocaleDateString('fr-CA')}</Text>
          </View>
        </View>

        <Text style={styles.title}>Reçu pour don de bienfaisance</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reçu émis à</Text>
          <View style={styles.donorInfo}>
            <Text style={{ fontWeight: 'bold' }}>{donorName}</Text>
            {donorContact && <Text style={styles.textMuted}>{donorContact}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du don</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text>Description</Text></View>
              <View style={styles.tableColAmountHeader}><Text>Montant</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text>Don pour soutenir l'éducation financière des jeunes</Text></View>
              <View style={styles.tableColAmount}><Text>{Number(amount).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <Text style={styles.totalText}>Total du don : {Number(amount).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</Text>
          </View>
        </View>

        <View style={styles.thankYou}>
          <Text>Merci de votre généreux soutien !</Text>
        </View>
        
        <View style={styles.registrationNumber}>
          <Text>Numéro d'enregistrement d'organisme de bienfaisance : {org_details.registration_number}</Text>
        </View>

        <View style={styles.footer}>
          <Text>
            Reçu officiel pour fins d'impôt. {org_details.org_name} - {org_details.website}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceDocument;
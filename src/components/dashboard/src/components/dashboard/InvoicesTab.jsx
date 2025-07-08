import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileText, Download, Loader2, AlertCircle, FileX2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InvoiceDocument from '@/components/InvoiceDocument';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const InvoicesTab = ({ invoices, loading, onReportIssue }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Factures</CardTitle>
        <CardDescription>
          Retrouvez ici tous vos reçus de dons pour vos impôts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : invoices.length > 0 ? (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Facture #{invoice.invoice_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Émise le {formatDate(invoice.issue_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="font-bold text-primary hidden sm:block">
                    {formatCurrency(invoice.amount)}
                  </p>
                  <PDFDownloadLink
                    document={<InvoiceDocument invoice={invoice} />}
                    fileName={`recu-wiibec-${invoice.invoice_number}.pdf`}
                  >
                    {({ loading }) =>
                      loading ? (
                        <Button variant="outline" size="icon" disabled>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="icon" title="Télécharger la facture">
                          <Download className="h-4 w-4" />
                        </Button>
                      )
                    }
                  </PDFDownloadLink>
                  <Button variant="ghost" size="icon" title="Signaler un problème" onClick={() => onReportIssue(invoice)}>
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileX2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Aucune facture disponible
            </h3>
            <p className="text-muted-foreground">
              Vos factures apparaîtront ici après chaque don réussi.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicesTab;
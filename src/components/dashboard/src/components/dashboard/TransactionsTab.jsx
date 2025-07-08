import React from 'react';
import { Link } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Heart, FileText, Download, Loader2, AlertCircle, FileX2 } from 'lucide-react';
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

const TransactionsTab = ({ donations, invoices, loading, onReportIssue }) => {
  const combined = [...donations.map(d => ({ ...d, type: 'donation' })), ...invoices.map(i => ({ ...i, type: 'invoice' }))]
    .sort((a, b) => new Date(b.created_at || b.issue_date) - new Date(a.created_at || a.issue_date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des Transactions</CardTitle>
        <CardDescription>
          Retrouvez ici vos dons et vos factures correspondantes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : combined.length > 0 ? (
          <div className="space-y-4">
            {combined.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg"
              >
                {item.type === 'donation' ? (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Donation
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatCurrency(item.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {item.payment_method}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Facture #{item.invoice_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Émise le {formatDate(item.issue_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-blue-500 hidden sm:block">
                        {formatCurrency(item.amount)}
                      </p>
                      <PDFDownloadLink
                        document={<InvoiceDocument invoice={item} />}
                        fileName={`recu-wiibec-${item.invoice_number}.pdf`}
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
                      <Button variant="ghost" size="icon" title="Signaler un problème" onClick={() => onReportIssue(item)}>
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileX2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Aucune transaction pour le moment
            </h3>
            <p className="text-muted-foreground mb-4">
              Commencez à soutenir l'éducation financière des jeunes.
            </p>
            <Link to="/donate">
              <Button className="bg-primary text-primary-foreground">
                Faire un don
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsTab;
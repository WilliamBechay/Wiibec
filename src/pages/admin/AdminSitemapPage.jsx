import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Home, User, FileText, Shield, Users } from 'lucide-react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, Handle, Position } from 'reactflow';

const nodeTypes = {
  custom: CustomNode,
};

function CustomNode({ data }) {
  const getIcon = () => {
    switch (data.type) {
      case 'home': return <Home className="h-5 w-5 mr-2" />;
      case 'user-hub': return <Users className="h-5 w-5 mr-2" />;
      case 'user': return <User className="h-5 w-5 mr-2" />;
      case 'admin': return <Shield className="h-5 w-5 mr-2" />;
      default: return <FileText className="h-5 w-5 mr-2" />;
    }
  };

  return (
    <div 
      className={`px-4 py-2 shadow-md rounded-md border-2 ${data.is_enabled ? 'bg-background border-primary' : 'bg-muted border-dashed border-muted-foreground'}`}
      style={{ minWidth: 220 }}
    >
      <div className="flex items-center">
        {getIcon()}
        <div className="flex-grow font-bold text-lg">{data.label}</div>
      </div>
      <div className={`text-sm ${data.is_enabled ? 'text-green-500' : 'text-red-500'}`}>
        {data.is_enabled ? 'Activé' : 'Désactivé'}
      </div>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
}


const AdminSitemapPage = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('page_settings')
        .select('*')
        .order('page_name', { ascending: true });

      if (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les pages pour le sitemap.',
          variant: 'destructive',
        });
        console.error(error);
      } else {
        setPages(data);
      }
      setLoading(false);
    };

    fetchPages();
  }, [toast]);

  useEffect(() => {
    if (pages.length > 0) {
      const homeNode = pages.find(p => p.page_key === 'home');
      const publicPages = pages.filter(p => !['home', 'dashboard', 'profile'].includes(p.page_key));
      const userPages = pages.filter(p => ['dashboard', 'profile'].includes(p.page_key));
      
      const initialNodes = [];
      const initialEdges = [];
      let yPos = 0;
      
      // Home Node
      if (homeNode) {
        initialNodes.push({
          id: 'home',
          type: 'custom',
          data: { label: homeNode.page_name, is_enabled: homeNode.is_enabled, type: 'home' },
          position: { x: 0, y: yPos },
        });
        yPos += 120;
      }

      // Public Pages
      publicPages.forEach((page, index) => {
        initialNodes.push({
          id: page.page_key,
          type: 'custom',
          data: { label: page.page_name, is_enabled: page.is_enabled, type: 'public' },
          position: { x: 0, y: yPos },
        });
        if (homeNode) {
          initialEdges.push({ id: `e-home-${page.page_key}`, source: 'home', target: page.page_key, animated: page.is_enabled });
        }
        yPos += 120;
      });

      // User Hub
      if (userPages.length > 0) {
        initialNodes.push({
            id: 'user-hub',
            type: 'custom',
            data: { label: 'Espace Utilisateur', is_enabled: true, type: 'user-hub' },
            position: { x: 0, y: yPos }
        });
        if (homeNode) {
            initialEdges.push({ id: 'e-home-user-hub', source: 'home', target: 'user-hub', animated: true });
        }
        yPos += 120;

        userPages.forEach((page) => {
            initialNodes.push({
                id: page.page_key,
                type: 'custom',
                data: { label: page.page_name, is_enabled: page.is_enabled, type: 'user' },
                position: { x: 0, y: yPos },
            });
            initialEdges.push({ id: `e-user-hub-${page.page_key}`, source: 'user-hub', target: page.page_key, animated: page.is_enabled });
            yPos += 120;
        });
      }

      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [pages, setNodes, setEdges]);
  
  const generateSitemapXML = () => {
    const siteUrl = window.location.origin;
    const today = new Date().toISOString();

    const urls = pages
      .filter(p => p.is_enabled)
      .map(page => {
        const path = page.page_key === 'home' ? '' : `/${page.page_key}`;
        const url = `${siteUrl}${path}`;
        const priority = page.page_key === 'home' ? '1.0' : '0.8';
        return `
  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
      }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  };

  const handleDownloadSitemap = () => {
    const sitemapContent = generateSitemapXML();
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Téléchargement réussi',
      description: 'Le fichier sitemap.xml a été généré.',
    });
  };

  return (
    <>
      <Helmet>
        <title>Sitemap Visuel - Administration</title>
        <meta name="description" content="Visualisez la structure du site de manière interactive." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Sitemap Visuel</h1>
          <Button onClick={handleDownloadSitemap} disabled={loading || pages.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger sitemap.xml
          </Button>
        </div>
        
        <Card className="h-[70vh] w-full">
          <CardHeader>
            <CardTitle>Arborescence du Site</CardTitle>
            <CardDescription>
              Représentation visuelle et verticale de la structure des pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(70vh-80px)]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
               <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  fitView
                  className="bg-muted/30"
                >
                  <Controls />
                  <MiniMap nodeColor={(n) => n.data.is_enabled ? '#10b981' : '#f43f5e'}/>
                  <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AdminSitemapPage;
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportBarProps {
  onExportCSV: () => void;
  onPrint: () => void;
}

const ExportBar = ({ onExportCSV, onPrint }: ExportBarProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-xl gap-2 btn-press">
          <Download size={16} />
          <span className="hidden sm:inline">Exporter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl w-48">
        <DropdownMenuItem onClick={onExportCSV} className="rounded-lg gap-3 cursor-pointer">
          <FileSpreadsheet size={16} className="text-success" />
          Exporter en CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPrint} className="rounded-lg gap-3 cursor-pointer">
          <Printer size={16} className="text-primary" />
          Imprimer / PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportBar;

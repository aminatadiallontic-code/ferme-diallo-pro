import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportBarProps {
  onExportCSV: () => void;
  onPrint: () => void;
}

const ExportBar = ({ onExportCSV, onPrint }: ExportBarProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl gap-2 btn-press h-9 text-xs">
          <Download size={14} />
          <span className="hidden sm:inline">Exporter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl w-44">
        <DropdownMenuItem onClick={onExportCSV} className="rounded-lg gap-2.5 cursor-pointer text-xs">
          <FileSpreadsheet size={14} className="text-success" />
          Exporter en CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPrint} className="rounded-lg gap-2.5 cursor-pointer text-xs">
          <Printer size={14} className="text-primary" />
          Imprimer / PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportBar;

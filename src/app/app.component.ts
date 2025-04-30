import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent implements OnInit {
  @ViewChild('reportCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngOnInit(): void {
    this.drawReport();
  }

drawReport(): void {
  const canvas = this.canvasRef.nativeElement;
  if (!canvas) {
    console.error('Canvas element is not available.');
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Canvas 2D context is not supported or not available.');
    return;
  }

  // Header
  ctx.fillStyle = '#003366';
  ctx.fillRect(0, 0, canvas.width, 100);
  ctx.fillStyle = 'white';
  ctx.font = '28px Arial';
  ctx.fillText('Springfield Academy', 20, 60);

  // Logo
  const logo = new Image();
  logo.src = 'assets/logo.jpg'; 
  logo.onload = () => {
    ctx.drawImage(logo, canvas.width - 100, 20, 60, 60);
  };
  logo.onerror = () => {
    console.error('Failed to load logo image. Please check the file path.');
  };
  // Subheading
  ctx.fillStyle = '#333';
  ctx.font = '20px Arial';
  ctx.fillText('Student Performance Report - 2025', 20, 130);

  // Table
  const headers = ['Name', 'Mobile', 'Nationality', 'Gender'];
  const data = [
    ['Ali Hassan', '01012345678', 'Egyptian', 'Male'],
    ['Sara Nabil', '01098765432', 'Jordanian', 'Female'],
  ];

  let startY = 180;
  ctx.font = '16px Arial';
  headers.forEach((header, i) => {
    ctx.fillStyle = '#003366';
    ctx.fillText(header, 20 + i * 180, startY);
  });

  startY += 30;
  data.forEach(row => {
    row.forEach((cell, i) => {
      ctx.fillStyle = '#000';
      ctx.fillText(cell, 20 + i * 180, startY);
    });
    startY += 30;
  });

  // Footer
  ctx.font = '14px italic';
  ctx.fillStyle = '#666';
  ctx.fillText(`Generated on: ${new Date().toLocaleDateString()}`, 20, canvas.height - 30);
}

  printReport(): void {
    const canvas = this.canvasRef.nativeElement;
    const dataUrl = canvas.toDataURL();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<img src="${dataUrl}" style="width:100%">`);
      printWindow.document.close();
      printWindow.print();
    }
  }

  exportPDF(): void {
    const canvas = this.canvasRef.nativeElement;
    html2canvas(canvas).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = canvas.height * width / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('report.pdf');
    });
  }

  exportExcel(): void {
    const data = [
      ['Name', 'Mobile', 'Nationality', 'Gender'],
      ['Ali Hassan', '01012345678', 'Egyptian', 'Male'],
      ['Sara Nabil', '01098765432', 'Jordanian', 'Female']
    ];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'report.xlsx');
  }
}

import { Service, inject } from '@angular/core';
import { jsPDF } from 'jspdf';
import { toDataURL } from 'qrcode';
import { Carrito } from './carrito';
import { Salas } from './salas';

@Service()
export class PdfCompra {
    private carrito = inject(Carrito);
    private salasService = inject(Salas);

    async generar(codigo: string, metodoPago: string) {
        const pelicula = this.carrito.pelicula();
        const funcion = this.carrito.funcion();
        const combo = this.carrito.combo();
        if (!pelicula || !funcion) {
            return;
        }

        const sala = await this.salasService.obtenerSalaPorId(funcion.sala_id);
        const inicio = new Date(funcion.inicio);
        const fecha = inicio.toLocaleDateString('es-AR');
        const hora = inicio.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

        const doc = new jsPDF({ unit: 'mm', format: 'a5' });

        // encabezado
        doc.setFillColor(43, 10, 12);
        doc.rect(0, 0, 148, 22, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text('CINEMA CLUB', 12, 14);
        doc.setFontSize(9);
        doc.text('ENTRADA', 136, 14, { align: 'right' });

        // pelicula
        doc.setTextColor(32, 21, 18);
        doc.setFontSize(16);
        const titulo = doc.splitTextToSize(pelicula.nombre.toUpperCase(), 124);
        doc.text(titulo, 12, 34);
        let y = 34 + titulo.length * 7;

        // funcion
        let nombreSala = '';
        if (sala) {
            nombreSala = sala.nombre;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('Fecha: ' + fecha + '    Hora: ' + hora, 12, y);
        y = y + 7;
        doc.text('Sala: ' + nombreSala + '    ' + funcion.formato + ' - ' + funcion.idioma, 12, y);
        y = y + 10;

        // butacas
        let butacas: string[] = [];
        for (let butaca of this.carrito.butacas()) {
            let texto = butaca.fila + butaca.columna;
            if (butaca.tipo === 'vip') {
                texto = texto + ' (VIP)';
            }
            butacas.push(texto);
        }
        doc.setFont('helvetica', 'bold');
        doc.text('Butacas', 12, y);
        doc.setFont('helvetica', 'normal');
        const lineasButacas = doc.splitTextToSize(butacas.join(', '), 124);
        doc.text(lineasButacas, 12, y + 6);
        y = y + 6 + lineasButacas.length * 5 + 4;

        // candy
        let candy: string[] = [];
        if (combo) {
            candy.push('1 x ' + combo.nombre);
        }
        for (let item of this.carrito.candy()) {
            candy.push(item.cantidad + ' x ' + item.nombre);
        }
        if (candy.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Candy', 12, y);
            doc.setFont('helvetica', 'normal');
            for (let linea of candy) {
                y = y + 6;
                doc.text(linea, 12, y);
            }
            y = y + 8;
        }

        // linea punteada
        doc.setLineDashPattern([1.5, 1.5], 0);
        doc.line(12, y, 136, y);
        doc.setLineDashPattern([], 0);
        y = y + 6;

        // QR
        const imagenQr = await toDataURL(codigo, { margin: 1, width: 300 });
        doc.addImage(imagenQr, 'PNG', 46.5, y, 55, 55);
        y = y + 61;
        doc.setFontSize(12);
        doc.text(codigo, 74, y, { align: 'center' });
        y = y + 6;
        doc.setFontSize(8);
        doc.text('Presentá este QR para ingresar a la sala y retirar tu candy.', 74, y, { align: 'center' });

        // aviso de edad
        if (pelicula.restriccion_edad > 0) {
            y = y + 6;
            doc.setTextColor(168, 52, 46);
            doc.text('Película +' + pelicula.restriccion_edad + ': los menores deben ir acompañados de un adulto.', 74, y, { align: 'center' });
        }

        // pie
        doc.setTextColor(32, 21, 18);
        doc.setFontSize(10);
        doc.text('Total: $' + this.carrito.total() + '    Pago: ' + metodoPago, 74, 200, { align: 'center' });

        doc.save('cinema-club-' + codigo + '.pdf');
    }
}
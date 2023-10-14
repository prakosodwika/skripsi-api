const cariTransaksi = (transaksis, cari, lunas) => {
    return transaksis.filter((transaksi) => {
        if (lunas.length !== 0 && transaksi.status === lunas){
            return transaksi.nama.match(cari);
        } else if (lunas.length === 0){
            return transaksi.nama.match(cari);
        }
    });
  }

const data = [
    { nama: "John Doe", alamat: "Jalan Contoh 123, Kota Contoh", status: 'lunas' },
    { nama: "Jane Smith", alamat: "Jalan Lain 456, Kota Lain", status: 'belum lunas' },
    { nama: "Alice Johnson", alamat: "Jalan Sebuah 789, Kota Sebuah", status: 'lunas' }
]

const tol = cariTransaksi(data, 'n', 'lunas')

console.log(tol);
// var myString = '';
// if (myString.length === 0) {
//     console.log("String kosong");
// } else {
//     console.log("String tidak kosong");
// }
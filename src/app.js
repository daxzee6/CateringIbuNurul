document.addEventListener('alpine:init', () => {
    Alpine.data('products', () => ({

        items: [
            { id: 1, name: 'paket 1', img:'paket1.jpeg', price: 15000},
            { id: 2, name: 'paket 2', img:'paket2.jpeg', price: 17000},
            { id: 3, name: 'paket 3', img:'paket3.jpeg', price: 15000},
            { id: 4, name: 'paket 4', img:'paket4.jpeg', price: 20000},
            { id: 5, name: 'paket 5', img:'paket5.jpeg', price: 20000},
            { id: 6, name: 'paket 6', img:'paket6.jpeg', price: 25000},
        ],
    }));

Alpine.store('cart', {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
        // cek barang
        const cartItem = this.items.find((item) => item.id === newItem.id);

        // jika item belum ada
        if (!cartItem) {
            this.items.push({ ...newItem, quantity: 1, total: newItem.price });
            this.quantity++;
            this.total += newItem.price;
        } else {
            //jika barang sudah ada, cek apakah ada duplikat
            this.items = this.items.map((item) => {
                //jika barang berbeda 
                if (item.id !== newItem.id) {
                    return item;
                } else {
                    //jika barang sudah ada, tambah quantity dan total
                    item.quantity++;
                    item.total = item.price * item.quantity;
                    this.quantity++;
                    this.total += item.price;
                        return item;
                    };
                });
            };
        },
    remove(id) {
        //ambil item yg di remove
        const cartItem = this.items.find((item) => item.id === id)

        // jika item lebih dari 1
        if(cartItem.quantity > 1) {
            // telusuri 1 1
            this.items = this.items.map((item) => {
                //jika bukan barang yang di klik
                if(item.id !== id) {
                    return item;
                } else {
                    item.quantity--;
                    item.total = item.price * item.quantity;
                    this.quantity--;
                    this.total -= item.price;
                    return item;
                }
            })
        } else if (cartItem.quantity === 1) {
        //jika barang sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
        }
    }
    });
});

// form validation
const checkoutButton = document.querySelector('.checkout-button');
checkoutButton.disabled = true;

const form = document.querySelector('#checkoutForm');

form.addEventListener('keyup', function() {
    for(let i = 0; i < form.elements.length; i++) {
        if (form.elements[i].value.length !== 0){
            checkoutButton.classList.remove('disabled');
            checkoutButton.classList.add('disabled');
        } else {
            return false;
        }
    }
    checkoutButton.disabled = false;
    checkoutButton.classList.remove('disabled');
});

//kirim data saat tombol di klik
checkoutButton.addEventListener('click', async function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const data = new URLSearchParams(formData);
    const objData = Object.fromEntries(data);

    try {
        const response = await fetch('php/placeOrder.php', {
            method: 'POST',
            body: data,
        });
        const token = await response.text();
        //console.log(token);
        window.snap.pay('token');
    } catch (err) {
        console.log(err.message);
    }
});


// format wa
const formatMessage = (obj) => {
    return `Data Customer
        Nama: ${obj.name}
        Email: ${obj.email}
        No HP: ${obj.phone}
Data Pesanan
    ${JSON.parse(obj.items).map((item) => `${item.name} (${item.quantity} x ${rupiah(item.total)}) \n`)}
TOTAL: ${rupiah(obj.total)}
Terimakasihhh.`;
}

// konversi Rupiah
const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits:0
    }).format(number);
};
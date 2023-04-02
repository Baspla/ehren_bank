
function buy() {
    let coupon = document.getElementById('coupon').value;
    let shop_id = document.getElementById('shop_id').value;
    let options = {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            coupon: coupon
        })
    };
    console.log("Kaufe")
    fetch('/shop/'+shop_id+'/kaufen', options).then(response => response.json()).then(data => {
        console.log(data)
        if (data.success) {
            console.log("Kauf erfolgreich")
            window.location.href = '/items';
        } else {
            alert("Fehler beim Kauf: " + data.error)
        }
    })
}

function redeem() {
    let coupon = document.getElementById('coupon').value;
    let shop_id = document.getElementById('shop_id').value;let options = {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            coupon: coupon
        })
    };
    fetch('/shop/'+shop_id+'/coupon', options).then(response => response.json()).then(data => {
        console.log(data)
        if (data.success) {
            //alert(`Coupon redeemed\nID: ${data.coupon.coupon_id}\nType: ${data.coupon.type}\nValue: ${data.coupon.value}`)
            let old_price = document.getElementById('shop_price').value;
            let pricetext = "Kostenlos"
            let balance = document.getElementById('balance').value;
            if (data.price > 0) {
                pricetext = data.price + " Ehre"
            }
            document.getElementById('preCoupon').classList.add('d-none')
            if(data.price !== old_price) {
                document.getElementById('price').innerText = pricetext
                document.getElementById('preCoupon').classList.remove('d-none')
            }
            document.getElementById('bonus').classList.remove('d-none')
            if(data.coupon.type === "bonus") {
                document.getElementById('bonus').innerText = (1+data.coupon.value)+ " für 1"
            }else if(data.coupon.type === "percent") {
                document.getElementById('bonus').innerText = data.coupon.value+ "% Rabatt"
            }else if(data.coupon.type === "fixed") {
                document.getElementById('bonus').innerText = data.coupon.value + " Ehre Rabatt"
            }else if(data.coupon.type === "free") {
                document.getElementById('bonus').innerText = "Kostenlos"
            }else {
                document.getElementById('bonus').classList.add('d-none')
            }
            if(data.price > balance) {
                document.getElementById('balanceText').classList.add('text-danger')
            } else {
                document.getElementById('balanceText').classList.remove('text-danger')
            }
            document.getElementById('coupon').classList.remove('is-invalid')
        } else {
            document.getElementById('preCoupon').classList.add('d-none')
            document.getElementById('bonus').classList.add('d-none')
            let old_price = document.getElementById('shop_price').value;
            let balance = document.getElementById('balance').value;
            if(old_price > balance) {
                document.getElementById('balanceText').classList.add('text-danger')
            } else {
                document.getElementById('balanceText').classList.remove('text-danger')
            }
            document.getElementById('price').innerText =old_price + " Ehre"
            document.getElementById('coupon').classList.add('is-invalid')
            document.getElementById('couponError').innerText = "Coupon ungültig"
        }
    })
}
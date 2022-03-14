//imports
const express = require("express");
const app = express();
const morgan = require("morgan");
var paypal = require("paypal-rest-sdk");
//middleware
app.use(morgan("dev"));
app.set("view engine", "ejs");
//body-parser
app.use(express.json());
//paypal config
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "Ab1ezi79QavPrDaJ1szcspsuo54bYf1TcLHXx6WYaTeiaz3WR6CcGDk3SeXldt_b-5Gg9MKYACCRjcyz",
  client_secret:
    "EBAnEYhcWLiIC8uxeEQylkHsomDNFNc-66heFLd3fI59rDIpIUceqkW6_y6U38WV2mgm_uNB_q8dnhxv",
});
/*
go to: sandbox.paypal.com
business acc
email: dharwinbusiness@gmail.com password: 123456789
personal acc
email: dharwinpaypal@gmail.com password: 123456789
cvv-306
*/
//router-config

//router
//display products
app.get("/", (req, res) => {
  res.render("index");
});
//payment
app.get("/pay", (req, res) => {
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "https://dwin-pay.herokuapp.com/success",
      cancel_url: "https://dwin-pay.herokuapp.com/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Flower Pot",
              sku: "Flower Pot",
              price: "20.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "20.00",
        },
        description: "Your Money cannot be returned for any reason.....",   
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      console.log(JSON.stringify(payment));
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});
//success
app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "20.00",
        },
      },
    ],
  };
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.render("success");
      }
    }
  );
});
app.get("/cancel", (req, res) => {
  res.render("cancel");
});
//server
const port = process.env.PORT || 5005;
app.listen(port, () => {
  console.log("application is started " + port);
});

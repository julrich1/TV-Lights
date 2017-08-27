const mdns = require("mdns");
const Hue = require("philips-hue");

const hue = new Hue;

const ccTargetName = "Living Room";
const lightState = {bri: 255, sat: 255, hue: 0}; //Red Full Brightness

hue.bridge = "192.168.1.212";  // from hue.getBridges
hue.username = require("./HUE_USERNAME"); // from hue.auth

setInterval(() => {
  // Workaround for IPv6 bug in MDNS
  const sequence = [
    mdns.rst.DNSServiceResolve(),
    "DNSServiceGetAddrInfo" in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({families:[4]}),
    mdns.rst.makeAddressesUnique()
  ];

  const browser = mdns.createBrowser(mdns.tcp("googlecast"), {resolverSequence: sequence});
  
  browser.start();
  
  browser.on("serviceUp", function(service) {
    if (service.txtRecord.fn === ccTargetName) {
      console.log("Found target device");

      if (service.txtRecord.rs) {

        console.log("Turning lights on");
        Promise.all([hue.light(7).on(), hue.light(8).on(), hue.light(7).setState(lightState), hue.light(8).setState(lightState)])
          .then(() => {
          })
          .catch((error) => {
            console.log(error);
          });
      }
      else {
        console.log("Turning lights off");
        Promise.all([hue.light(7).off(), hue.light(8).off()])
          .then(() => {
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }

    browser.stop();
  });
}, 5000);
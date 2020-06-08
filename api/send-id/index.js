module.exports = async function (context, req) {
  context.res = {
     body: { 
       id: process.env.MY_LIFF_ID 
     }
  };
};

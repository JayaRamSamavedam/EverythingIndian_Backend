import Order from '../schema/ordersSchema.js';
import Cart from '../schema/cartSchema.js';
import Product from '../schema/productSchema.js';
import User from '../schema/userSchema.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';


// Buy Now from Cart
// router.post('/order/buy-from-cart',
export const CartBuyNow =  async (req, res) => {
  try {
    const { userId, paymentDetails, shipmentAddress } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const cart = await Cart.findOne({ user: user.email });
    if (!cart) {
      return res.status(404).send({ error: 'Cart not found' });
    }

    const order = new Order({
      user: user._id,
      items: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      paymentDetails,
      shipmentAddress,
      shipmentCharges: 50, // Example shipment charge
    });

    await order.save();
    await Cart.deleteOne({ user: user.email }); // Clear the cart after order is placed

    res.status(201).send(order);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Direct Buy Now
// router.post('/order/buy-now',
    export const ProductBuyNow =  async (req, res) => {
  try {
    const { userId, productId, quantity, paymentDetails, shipmentAddress } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }

    const order = new Order({
      user: user._id,
      items: [{
        productId: product.productId,
        quantity,
        price: product.discountedPrice * quantity,
      }],
      paymentDetails,
      shipmentAddress,
      shipmentCharges: 50, // Example shipment charge
    });

    await order.save();

    res.status(201).send(order);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Generate Bill
// router.get('/order/:orderId/bill', 
export const orderBill = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate('user items.productId');
    if (!order) {
      return res.status(404).send({ error: 'Order not found' });
    }

    const user = await User.findById(order.user);

    const doc = new PDFDocument();
    const filename = `invoice_${order._id}.pdf`;
    const filePath = `./invoices/${filename}`;

    // Create invoices directory if it doesn't exist
    if (!fs.existsSync('./invoices')) {
      fs.mkdirSync('./invoices');
    }

    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(25).text('Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`User: ${user.uname} (${user.email})`);
    doc.text(`Order Date: ${order.createdAt.toDateString()}`);
    doc.moveDown();

    doc.fontSize(15).text('Shipment Address', { underline: true });
    doc.fontSize(12).text(`${order.shipmentAddress.street}`);
    doc.text(`${order.shipmentAddress.city}, ${order.shipmentAddress.state}, ${order.shipmentAddress.postalCode}`);
    doc.text(`${order.shipmentAddress.country}`);
    doc.moveDown();

    doc.fontSize(15).text('Items', { underline: true });
    order.items.forEach((item, index) => {
      doc.fontSize(12).text(`Item ${index + 1}:`);
      doc.text(`Product ID: ${item.productId.productId}`);
      doc.text(`Product Name: ${item.productId.name}`);
      doc.text(`Quantity: ${item.quantity}`);
      doc.text(`Price: $${(item.price *req.Currency).toFixed(2)}`);
      doc.moveDown();
    });

    doc.fontSize(15).text('Payment Details', { underline: true });
    doc.fontSize(12).text(`Method: ${order.paymentDetails.method}`);
    doc.text(`Transaction ID: ${order.paymentDetails.transactionId}`);
    doc.text(`Status: ${order.paymentDetails.status}`);
    doc.moveDown();

    doc.fontSize(15).text('Summary', { underline: true });
    doc.fontSize(12).text(`Total Amount: $${order.totalAmount.toFixed(2)}`);
    doc.text(`Shipment Charges: $${order.shipmentCharges.toFixed(2)}`);
    doc.text(`Grand Total: $${(order.totalAmount + order.shipmentCharges).toFixed(2)}`);

    doc.end();

    res.download(filePath, filename, (err) => {
      if (err) {
        res.status(500).send({ error: 'Failed to download the invoice' });
      } else {
        fs.unlinkSync(filePath); // Delete the file after download
      }
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// export default router;

export const getAllOrders = async (req,res)=>{
  try{
    const orders = await Order.find();
    if(!orders){
      return res.status(400).json({error:"orders not found"});
    }
    const updatedOrders = orders.map(order => {
      const updatedOrder = order.toObject();
      updatedOrder.items = updatedOrder.items.map(item => {
          item.price = item.price * req.Currency;
          return item;
      });
      updatedOrder.totalAmount = updatedOrder.items.reduce((total, item) => total + item.price, 0);
      return updatedOrder;
  });

    return res.status(200).json(updatedOrders);
  }
  catch{
    return res.status(500).json(error);
  }
};


export const updateOrderStatus = async(req,res) =>{
  const orderId = req.params.orderId;
  const {orderStatus,orderStatusMessage} = req.body;
  const updates = {}
  if(orderStatus){
    updates[orderStatus] = orderStatus;
  }
  if(orderStatusMessage){
    updates[orderStatusMessage] = orderStatusMessage;
  }
  if(!orderId){
    return res.status(400).json({error:"order not found"});
  }
  try{
    const order= await Order.findByIdAndUpdate({orderId},updates);
    if(!order){
      return res.status(400).json({error:"orderid not found"});
    }
    return res.status(200).json({message:"order status sucessfully updated"});
  }
  catch(error){
    return res.status(500).json(error);
  }
}

export const deleteOrder = async (req,res)=>{
  const orderId = req.params;
  if(!orderId){
    return res.status(400).json({error:"orderid not found"})
  }
  try{
    const order = await Order.findByIdAndDelete(orderId);
    return res.status(200).json({message:"deleted the order sucessfully"});
  }
  catch(error){
    return res.status(500).json(error);
  }
}

// Get URL parameters
//https://discord.com/channels/1250571745233076334/${channel}
$(document).ready(function() {
  const urlParams = new URLSearchParams(window.location.search);

// Check if 'user' and 'channel' exist
if (urlParams.has("user") && urlParams.has("channel")) {
  const channel = urlParams.get("channel");
  $("#purchase-btn").attr("href",`https://discord.com/channels/1250571745233076334/${channel}`);

    console.log(channel);
  } else {
    console.log("Missing 'user' or 'channel' parameter.");
}

$("#purchase-btn").on("click", function() {
  if (urlParams.has("user") && urlParams.has("channel")) {
  const webhookURL ="https://discord.com/api/webhooks/1380529555181277234/FSicReu-mRID6koItXuK9GnGdYHXqktmZi9EK8fZt6CbADQFKwXwBPMD2v3sdidDggKK"; 
  const user = urlParams.get("user");
  const channelID = urlParams.get("channel"); // Replace with the correct channel ID

  // Prepare cart summary as plain message
  let cartLines = [];

  // Loop through each cart item and format it as plain text
  $(".cart-qty-input").each(function (index) {
    const itemName = $(this).attr("data-name");
    const quantity = $(this).val();
    const price = $(".cart-price").eq(index).html();

    cartLines.push(
      `\`\`\` \n${itemName} nQty(${quantity}) Price: ${price}\n\`\`\``
    );
  });

  // Extract total price and format it
  const totalPrice = $("#cart-total").html();
  const totalLine = `\n\`\`\`\n💰 Total Cost: ${totalPrice}\n\`\`\``;

  // Build the full message
  const finalMessage = `<#${channelID}> ${cartLines.join(
    "\n\n"
  )}\n\n${totalLine}\n\n<@${user}>`;

  // Construct the payload with only 'content'
  const messageData = {
    content: finalMessage,
  };

  // Send data to the webhook
  $.ajax({
    url: webhookURL,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(messageData),
    success: function (response) {
      console.log("Message sent successfully!");
    },
    error: function (xhr) {
      console.error("Error:", xhr.responseText);
    },
  });
}});

});

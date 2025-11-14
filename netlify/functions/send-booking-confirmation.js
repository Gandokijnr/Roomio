import nodemailer from 'nodemailer';

export const handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { 
      to, 
      reservationData, 
      hotelInfo = {
        name: 'Roomio Hotel',
        address: '123 Hotel Street, City, Country',
        phone: '+1 (555) 123-4567',
        email: 'info@roomiohotel.com',
        website: 'www.roomiohotel.com'
      }
    } = JSON.parse(event.body);

    // Validate required fields
    if (!to || !reservationData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: to, reservationData' }),
      };
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or your preferred service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use app password for Gmail
      },
    });

    // Generate booking confirmation HTML
    const htmlContent = generateBookingConfirmationHTML(reservationData, hotelInfo);

    // Email options
    const mailOptions = {
      from: `"${hotelInfo.name}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Booking Confirmation - ${reservationData.reservation_number}`,
      html: htmlContent,
      attachments: [
        {
          filename: 'logo.png',
          path: 'https://via.placeholder.com/200x80/2563eb/ffffff?text=ROOMIO', // Replace with actual logo URL
          cid: 'logo'
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ 
        success: true, 
        messageId: info.messageId,
        message: 'Booking confirmation sent successfully' 
      }),
    };

  } catch (error) {
    console.error('Email sending error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      }),
    };
  }
};

function generateBookingConfirmationHTML(reservation, hotel) {
  const checkInDate = new Date(reservation.check_in_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const checkOutDate = new Date(reservation.check_out_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const nights = Math.ceil((new Date(reservation.check_out_date) - new Date(reservation.check_in_date)) / (1000 * 60 * 60 * 24));

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header img {
                max-width: 200px;
                height: auto;
                margin-bottom: 15px;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .content {
                padding: 30px;
            }
            .confirmation-box {
                background: #f0f9ff;
                border: 2px solid #2563eb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            .confirmation-number {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin: 10px 0;
            }
            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 25px 0;
            }
            .detail-item {
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #2563eb;
            }
            .detail-label {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            .detail-value {
                font-size: 16px;
                color: #111827;
                font-weight: 500;
            }
            .summary-table {
                width: 100%;
                border-collapse: collapse;
                margin: 25px 0;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .summary-table th,
            .summary-table td {
                padding: 15px;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }
            .summary-table th {
                background: #f9fafb;
                font-weight: 600;
                color: #374151;
            }
            .total-row {
                background: #f0f9ff;
                font-weight: bold;
                color: #2563eb;
            }
            .qr-section {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background: #f9fafb;
                border-radius: 8px;
            }
            .qr-code {
                width: 120px;
                height: 120px;
                margin: 15px auto;
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #6b7280;
            }
            .footer {
                background: #f9fafb;
                padding: 25px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            .hotel-info {
                margin: 15px 0;
                color: #6b7280;
                font-size: 14px;
                line-height: 1.5;
            }
            .contact-info {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin: 15px 0;
                flex-wrap: wrap;
            }
            .contact-item {
                color: #2563eb;
                text-decoration: none;
                font-size: 14px;
            }
            .special-requests {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
            }
            .special-requests h4 {
                margin: 0 0 10px 0;
                color: #92400e;
            }
            @media (max-width: 600px) {
                .details-grid {
                    grid-template-columns: 1fr;
                }
                .contact-info {
                    flex-direction: column;
                    gap: 10px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="cid:logo" alt="${hotel.name}" />
                <h1>Booking Confirmed!</h1>
                <p>Thank you for choosing ${hotel.name}</p>
            </div>
            
            <div class="content">
                <div class="confirmation-box">
                    <h2>Your Reservation is Confirmed</h2>
                    <div class="confirmation-number">${reservation.reservation_number}</div>
                    <p>Please keep this confirmation number for your records</p>
                </div>

                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-label">Guest Name</div>
                        <div class="detail-value">${reservation.guest?.first_name} ${reservation.guest?.last_name}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Room</div>
                        <div class="detail-value">Room ${reservation.room?.room_number}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Check-in</div>
                        <div class="detail-value">${checkInDate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Check-out</div>
                        <div class="detail-value">${checkOutDate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Guests</div>
                        <div class="detail-value">${reservation.number_of_adults} Adult${reservation.number_of_adults !== 1 ? 's' : ''}${reservation.number_of_children ? `, ${reservation.number_of_children} Child${reservation.number_of_children !== 1 ? 'ren' : ''}` : ''}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Booking Source</div>
                        <div class="detail-value">${reservation.booking_source}</div>
                    </div>
                </div>

                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Room ${reservation.room?.room_number} - ${nights} night${nights !== 1 ? 's' : ''}</td>
                            <td>${nights}</td>
                            <td>$${reservation.room?.price_per_night || (reservation.total_amount / nights).toFixed(2)}</td>
                            <td>$${reservation.total_amount.toFixed(2)}</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="3"><strong>Total Amount</strong></td>
                            <td><strong>$${reservation.total_amount.toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>

                ${reservation.special_requests ? `
                <div class="special-requests">
                    <h4>Special Requests</h4>
                    <p>${reservation.special_requests}</p>
                </div>
                ` : ''}

                <div class="qr-section">
                    <h3>Quick Check-in</h3>
                    <p>Show this QR code at reception for faster check-in</p>
                    <div class="qr-code">
                        QR Code<br/>
                        ${reservation.reservation_number}
                    </div>
                    <p><small>Or simply provide your confirmation number: <strong>${reservation.reservation_number}</strong></small></p>
                </div>

                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="margin-top: 0; color: #2563eb;">Important Information</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>Check-in time: 3:00 PM</li>
                        <li>Check-out time: 11:00 AM</li>
                        <li>Please bring a valid photo ID</li>
                        <li>Free cancellation up to 24 hours before check-in</li>
                        <li>Contact us for any special arrangements</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <div class="hotel-info">
                    <strong>${hotel.name}</strong><br/>
                    ${hotel.address}
                </div>
                <div class="contact-info">
                    <a href="tel:${hotel.phone}" class="contact-item">📞 ${hotel.phone}</a>
                    <a href="mailto:${hotel.email}" class="contact-item">✉️ ${hotel.email}</a>
                    <a href="https://${hotel.website}" class="contact-item">🌐 ${hotel.website}</a>
                </div>
                <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 12px;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

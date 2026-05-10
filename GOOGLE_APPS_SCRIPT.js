/**
 * GOOGLE APPS SCRIPT CODE
 * 1. Create a Google Sheet.
 * 2. Add the following headers to the first row (A1 to J1):
 *    ID, Timestamp, Email, Niche, Audience, Format, Goal, Idea, Feedback, EmailSent
 * 3. Go to Extensions > App Script.
 * 4. Paste the following code:
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var id = data.id || (data.email + data.selectedIdea);
  
  // Find existing row by ID
  var rows = sheet.getDataRange().getValues();
  var rowIndex = -1;
  var emailAlreadySent = false;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      rowIndex = i + 1;
      emailAlreadySent = rows[i][9] === true || rows[i][9] === "true"; // Column J
      break;
    }
  }

  var rowData = [
    id,
    new Date(), 
    data.email, 
    data.niche, 
    data.audience, 
    data.format, 
    data.goal || '',
    data.selectedIdea, 
    data.feedback || '',
    emailAlreadySent
  ];

  if (rowIndex > 0) {
    rowData[1] = rows[rowIndex-1][1]; // Preserve original timestamp
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
    rowIndex = sheet.getLastRow();
  }
  
  // Send Email if scripts are present and it's the first time
  if (data.email && data.scripts && !data.feedback && !emailAlreadySent) {
    var scripts = data.scripts;
    
    function formatEmailScript(label, content) {
      if (!content) return '';
      
      var scriptObj = content;
      // Handle the case where content might be arrived as a JSON string
      if (typeof content === 'string') {
        try {
          var parsed = JSON.parse(content);
          if (parsed && typeof parsed === 'object') {
            scriptObj = parsed;
          }
        } catch (e) {
          // Not JSON, just a string
          return `
            <div style="margin-bottom: 30px; background: white; border-radius: 12px; padding: 25px; border: 1px solid #eee;">
              <h3 style="text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 2px; color: #8A9A5B; margin-top: 0; margin-bottom: 15px;">${label}</h3>
              <p style="font-size: 14px; line-height: 1.6; color: #1a1a1a; margin: 0; white-space: pre-wrap;">${content}</p>
            </div>
          `;
        }
      }
      
      // If it's a structured object, format it clearly
      if (scriptObj && typeof scriptObj === 'object' && (scriptObj.hook || scriptObj.meat)) {
        var meatHtml = (scriptObj.meat || []).map(function(m) {
          return '<li style="margin-bottom: 8px;">' + m + '</li>';
        }).join('');
        
        var hashtagsHtml = (scriptObj.hashtags || []).map(function(h) {
          return '<span style="color: #8A9A5B; margin-right: 8px;">' + h + '</span>';
        }).join('');

        return `
          <div style="margin-bottom: 30px; background: white; border-radius: 12px; padding: 25px; border: 1px solid #eee;">
            <h3 style="text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 2px; color: #8A9A5B; margin-top: 0; margin-bottom: 20px;">${label}</h3>
            
            <div style="margin-bottom: 20px;">
              <strong style="font-size: 11px; text-transform: uppercase; color: #999; display: block; margin-bottom: 5px;">The Hook</strong> 
              <div style="font-size: 14px; line-height: 1.6; color: #1a1a1a;">${scriptObj.hook || 'N/A'}</div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="font-size: 11px; text-transform: uppercase; color: #999; display: block; margin-bottom: 10px;">The Meat</strong>
              <ul style="font-size: 14px; line-height: 1.6; padding-left: 20px; color: #404040; margin: 0;">${meatHtml || '<li>N/A</li>'}</ul>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="font-size: 11px; text-transform: uppercase; color: #999; display: block; margin-bottom: 5px;">Visual Cues</strong> 
              <div style="font-size: 13px; font-style: italic; color: #666; font-family: Georgia, serif;">${scriptObj.visuals || 'N/A'}</div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="font-size: 11px; text-transform: uppercase; color: #999; display: block; margin-bottom: 5px;">The CTA</strong> 
              <div style="font-size: 14px; font-weight: bold; color: #8A9A5B;">${scriptObj.cta || 'N/A'}</div>
            </div>

            <div style="margin-bottom: 15px; background: #f9f9f8; padding: 15px; border-radius: 8px;">
              <strong style="font-size: 11px; text-transform: uppercase; color: #999; display: block; margin-bottom: 8px;">Caption</strong> 
              <div style="font-size: 13px; line-height: 1.5; color: #444;">${scriptObj.caption || 'N/A'}</div>
            </div>

            <div style="margin: 0;">
              <strong style="font-size: 11px; text-transform: uppercase; color: #999; display: block; margin-bottom: 5px;">Hashtags</strong> 
              <div style="font-size: 12px; font-weight: bold;">${hashtagsHtml || 'N/A'}</div>
            </div>
          </div>
        `;
      }
      
      // Fallback for strings or other formats
      return `
        <div style="padding: 25px; border: 1px solid #eee; margin-bottom: 30px; border-radius: 12px; background: white;">
          <h3 style="text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 2px; color: #8A9A5B; margin-top:0; margin-bottom: 15px;">${label}</h3>
          <div style="font-size: 14px; line-height: 1.6; color: #1a1a1a; white-space: pre-wrap;">${typeof scriptObj === 'object' ? JSON.stringify(scriptObj, null, 2) : String(scriptObj)}</div>
        </div>
      `;
    }

    try {
      MailApp.sendEmail({
        to: data.email,
        subject: "VIBE SCRIPT: " + data.selectedIdea,
        htmlBody: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background: #fafaf9; padding: 40px; border-radius: 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="margin-bottom: 20px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8A9A5B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto;">
                  <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
                  <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
                  <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
                </svg>
              </div>
              <h1 style="font-weight: 200; font-size: 20px; letter-spacing: 4px; text-transform: uppercase; margin: 0; color: #1a1a1a;">Vibe Script</h1>
              <div style="font-size: 9px; color: #999; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px; font-weight: bold;">Precision Ideation Engine</div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 40px; border: 1px solid #eee;">
              <p style="text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 1px; color: #8A9A5B; margin-bottom: 5px;">STRATEGY BRIEF</p>
              <h2 style="font-weight: 400; font-size: 20px; margin: 0 0 20px 0; color: #1a1a1a; font-style: italic;">${data.selectedIdea}</h2>
              
              <div style="font-size: 13px; line-height: 1.6; color: #666;">
                <p style="margin: 5px 0;"><strong>Niche:</strong> ${data.niche || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Audience:</strong> ${data.audience || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Goal:</strong> ${data.goal || 'N/A'}</p>
              </div>
            </div>

            ${formatEmailScript('Standard Strategy', scripts.standard)}
            ${formatEmailScript('Storyteller Variation', scripts.storyteller)}
            ${formatEmailScript('Viral Hook Variation', scripts.viral)}

            <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;">
            
            <div style="text-align: center; font-size: 11px; color: #999; letter-spacing: 1px; text-transform: uppercase;">
               © 2026 Vibe Script | Strategy Engine v1.2
            </div>
          </div>
        `
      });
      // Mark as sent
      sheet.getRange(rowIndex, 10).setValue(true);
    } catch (e) {}
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

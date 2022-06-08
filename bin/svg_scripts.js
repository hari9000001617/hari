      /*  Constants: */
      var FZoom            = 1.1;
      var FHorzScrollRight = 20;
      var FHorzScrollLeft  = -20;
      var FVertScrollDown = 20;
      var FVertScrollUp  = -20;
      var leftArrow        = 37;	// The numeric code for the left arrow key.
      var upArrow          = 38;
      var rightArrow       = 39;
      var downArrow        = 40;
     
      var SVGDocument = null;
      var SVGRoot = null;
      var SVGViewBox = null;
      var svgns = 'http://www.w3.org/2000/svg';
      var xlinkns = 'http://www.w3.org/1999/xlink';
      var toolTip = null;
      var TrueCoords = null;
      var ScreenHeight = null;
      var ScreenWidth = null;
      var tipBox = null;
      var tipText = null;
      var tipTitle = null;
      var tipDesc1 = null;
      var tipDesc2 = null;
      var tipDesc3 = null;
      var tipDesc4 = null;
      var tipDesc5 = null;
      var tipAlert = null;
      var gradBox = null;
      var TaskViewElement = null;
      var HeaderElement = null;
      var CalendarElement = null;
      var TaskElement = null;
      
      var progScale = null;

      var lastElement = null;
      var titleText = '';
      var titleDesc1 = '';
      var titleDesc2 = '';
      var titleDesc3 = '';
      var titleDesc4 = '';
      var titleDesc5 = '';
      var titleAlert = null;
      var MozillaSVG = 1;
      var HasAutomation = 0;


      function Init(evt)
      {
         SVGDocument = evt.target.ownerDocument;
         SVGRoot = document.documentElement;
         TrueCoords = SVGRoot.createSVGPoint();

         toolTip = SVGDocument.getElementById('ToolTip');
         tipBox = SVGDocument.getElementById('tipbox');
         tipText = SVGDocument.getElementById('tipText');
         tipTitle = SVGDocument.getElementById('tipTitle');
         tipDesc1 = SVGDocument.getElementById('tipDesc1');
         tipDesc2 = SVGDocument.getElementById('tipDesc2');
         tipDesc3 = SVGDocument.getElementById('tipDesc3');
         tipDesc4 = SVGDocument.getElementById('tipDesc4');
         tipDesc5 = SVGDocument.getElementById('tipDesc5');
         tipAlert = SVGDocument.getElementById('tipAlert');
         
         TaskViewElement = document.getElementById('TaskView');			// Best to only access the SVG element after the page has fully loaded.
	 HeaderElement   = document.getElementById('header');
	 CalendarElement = document.getElementById('calendar');
	 TaskElement     = document.getElementById('tasks');

         /* Add event listeners: */
         window.addEventListener('keydown', ProcessKeyPress, true);		// OK to let the keydown event bubble.
         window.addEventListener('mousewheel', MouseWheelZoom, false);	    // Dont let the mousewheel event bubble up to stop native browser window scrolling.
         
         window.focus();  

         // Check if automation is available by checking the type of name.
         try
         {
             var lNameType = typeof(window.external.Name);
             if (lNameType == 'string')
             {
                 HasAutomation = 1;    
             }
         }
         catch(er){}
         
         try
         {
             var loutline = tipText.getBBox()         
             MozillaSVG = 0;
         }
         catch(er){}
      };


      function GetScreenSize() 
      {
        
         //Object detection
         //Non-IE         
          if ( typeof( window.innerWidth ) == 'number' ) 
          {
         
              ScreenWidth = window.innerWidth;
              ScreenHeight = window.innerHeight;                             
          } 
          else 
          //IE 6+ in 'standards compliant mode'
          if ( document.documentElement &&
                  ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) 
          {
              ScreenWidth = document.body.clientWidth;  //document.documentElement.clientWidth
              ScreenHeight = document.body.clientHeight;
              
          } 
          else 
           //IE 4 compatible
          if ( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) 
          {
              ScreenWidth = document.body.clientWidth;
              ScreenHeight = document.body.clientHeight;
              
          }
      }


      function GetTrueCoords(evt)
      {
         // find the current zoom level and pan setting, and adjust the reported
         //    mouse position accordingly
         var newScale = SVGRoot.currentScale;
         var translation = SVGRoot.currentTranslate;
         TrueCoords.x = (evt.clientX - translation.x)/newScale;
         TrueCoords.y = (evt.clientY - translation.y)/newScale;

      };




      function ShowTooltip(evt, turnOn)
      {
         try
         {
            if (!evt || !turnOn)
            {
               toolTip.setAttributeNS(null, 'display', 'none');
            }
            else
            {           
                     
               var tipScale = 1/SVGRoot.currentScale;
               var textWidth = 0;
               var tspanWidth = 0;
               var boxHeight = 20;

               tipBox.setAttributeNS(null, 'transform', 'scale(' + tipScale + ',' + tipScale + ')' );
               tipText.setAttributeNS(null, 'transform', 'scale(' + tipScale + ',' + tipScale + ')' );
               
	       var targetElement = evt.target;   
               
               if (( lastElement != targetElement ) && ( targetElement.id != 'TaskView'))
               {
               
                   if (MozillaSVG == 1)
	           {	               
	               var targetTitle = targetElement.getElementsByTagName('title')[0];
	               var targetDesc = targetElement.getElementsByTagName('desc1')[0];
	               var targetDesc2 = targetElement.getElementsByTagName('desc2')[0];
	               var targetDesc3 = targetElement.getElementsByTagName('desc3')[0];
	               var targetDesc4 = targetElement.getElementsByTagName('desc4')[0];
	               var targetDesc5 = targetElement.getElementsByTagName('desc5')[0];
	               var targetAlert = targetElement.getElementsByTagName('alert')[0];
	           }
	           else
	           {
	       	       
	               var targetTitle = targetElement.getElementsByTagName('title').item(0);
	               var targetDesc = targetElement.getElementsByTagName('desc1').item(0);
	               var targetDesc2 = targetElement.getElementsByTagName('desc2').item(0);
	               var targetDesc3 = targetElement.getElementsByTagName('desc3').item(0);
	               var targetDesc4 = targetElement.getElementsByTagName('desc4').item(0);
	               var targetDesc5 = targetElement.getElementsByTagName('desc5').item(0);
	               var targetAlert = targetElement.getElementsByTagName('alert').item(0);	       	       
	           }
               
                  
                  if ( targetTitle )
                  {
                     titleText = targetTitle.firstChild.nodeValue;
                     tipTitle.firstChild.nodeValue = titleText;
                  }
                  else
                      tipTitle.firstChild.nodeValue = '';	
                  
                  if ( targetDesc )
                  {
                     titleDesc1 = targetDesc.firstChild.nodeValue;
                     tipDesc1.firstChild.nodeValue = titleDesc1;
                  }
                  else
                      tipDesc1.firstChild.nodeValue = '';                  
                  
                  if ( targetDesc2 )
                  {
                     titleDesc2 = targetDesc2.firstChild.nodeValue;
                     tipDesc2.firstChild.nodeValue = titleDesc2;
                  }
                  else
                      tipDesc2.firstChild.nodeValue = '';
                 
                  if ( targetDesc3 )
                  {
                     titleDesc3 = targetDesc3.firstChild.nodeValue;
                     tipDesc3.firstChild.nodeValue = titleDesc3;
                  }
                  else
                      tipDesc3.firstChild.nodeValue = '';
                      
                  if ( targetDesc4 )
                  {
                     titleDesc4 = targetDesc4.firstChild.nodeValue;
                     tipDesc4.firstChild.nodeValue = titleDesc4;
                  }
                  else
                      tipDesc4.firstChild.nodeValue = '';
                      
                  if ( targetDesc5 )
                  {
                     titleDesc5 = targetDesc5.firstChild.nodeValue;
                     tipDesc5.firstChild.nodeValue = titleDesc5;
                  }
                  else
                      tipDesc5.firstChild.nodeValue = '';
                  
                  if (targetAlert)
                  {
                      titleAlert = targetAlert.firstChild.nodeValue;
                      tipAlert.firstChild.nodeValue = titleAlert;
                  }
                  else
                      tipAlert.firstChild.nodeValue = '';                      
               
               }

               var xPos;
               var yPos;
                           
               // GetBBox for SVG elements isn't robustly supported by firefox so use getBoundingClientRect instead.
               if (MozillaSVG == 1)
               {
                   var outline = tipText.getBoundingClientRect();    
               }
               else
               {
                   var outline = tipText.getBBox();
               }               
               
               GetScreenSize();    
              
               
               if (TrueCoords.x > (ScreenWidth / 2) )
               {
                   xPos = TrueCoords.x - (tipScale * (10 + Number(outline.width)));    
               }
               else
               {
                   xPos = TrueCoords.x + (10 * tipScale);
               }

               if (TrueCoords.y > (ScreenHeight / 2) )
               {
                   yPos = TrueCoords.y - (tipScale * (10 + Number(outline.height)));
               }
               else
               {
                   yPos = TrueCoords.y + (10 * tipScale);
               }

               
               
               // If the cursor is exactly on a outline edge then a rediculous number will be returned.
               // In this case, exit without showing the text.
               if (xPos < 0 || xPos > ScreenWidth || yPos < 0 || yPos > ScreenHeight ) 
               {
                   return;   
               }

               yPos = Math.floor(yPos) + window.pageYOffset;
               xPos = Math.floor(xPos) + window.pageXOffset;
               
               
               if (Number(outline.width) != 0 )
               {
                             
                   tipBox.setAttributeNS(null, 'width', Number(outline.width) + 10);
                   tipBox.setAttributeNS(null, 'height', Number(outline.height) + 10);
               
                   toolTip.setAttributeNS(null, 'transform', 'translate(' + xPos.toString() + ',' + yPos.toString() + ')');
 
                   toolTip.setAttributeNS(null, 'display', 'inline');                   
                   
               }
               // Remove the textbox if it fails to find the object to draw the rect around. This sometimes happens in firefox.              
               else
               {
                                    
                   tipTitle.firstChild.nodeValue = '';
                   tipDesc1.firstChild.nodeValue = '';
                   tipDesc2.firstChild.nodeValue = '';
                   tipDesc3.firstChild.nodeValue = '';
                   tipDesc4.firstChild.nodeValue = '';
                   tipDesc5.firstChild.nodeValue = '';
                   tipAlert.firstChild.nodeValue = ''; 
                   
                   tipBox.setAttributeNS(null, 'width', 0);
		   tipBox.setAttributeNS(null, 'height', 0);
		   
		   toolTip.setAttributeNS(null, 'transform', 'translate(' + xPos.toString() + ',' + yPos.toString() + ')');
		    
                   toolTip.setAttributeNS(null, 'display', 'inline');                   
                   
                   
                   
               }
             
            }
         }
         catch(er){
           alert("An exception occurred in the script svg_scripts. Error name: " + er.name 
                     + ". Error message: " + er.message);
         }
       
       };
       
       
      function ShowEntity(evt)
      {
         try
         {
            // window.external is not supported by Firefox
            if ((evt) && (HasAutomation))
            {
               if ((evt.button == 0) && (!evt.altKey) && (!evt.ctrlKey))
               {
                  var targetElement = evt.target;
                  
                  if (( lastElement != targetElement ) && ( targetElement.id != 'TaskView'))
                  {
                     var entity = targetElement.getElementsByTagName('entity').item(0);
                     var entityID = targetElement.getElementsByTagName('entity_id').item(0);
                     var acceptfieldnames = SVGDocument.getElementsByTagName('acceptfieldnames').item(0);
                     var acceptfieldvalues = SVGDocument.getElementsByTagName('acceptfieldvalues').item(0);
                     if (entityID)
                     {
                         if (entityID.firstChild.nodeValue.indexOf(',') != -1)
                         {
                             // Display a list form
                             window.external.ListForm(entity.firstChild.nodeValue, entityID.firstChild.nodeValue, 
                                                      acceptfieldnames.firstChild.nodeValue,
                                                      acceptfieldvalues.firstChild.nodeValue );
                         }
                         else
                         {
                             // Display a detail form
                             window.external.DetailForm(entity.firstChild.nodeValue + '_EDT', entityID.firstChild.nodeValue,0, null, null);
                         }
                     }
                  }
               }
               
            }
         }
         catch(er){}
      };       
      
      function zoom(zoomType)
      {
         var ltaskviewwidth = TaskViewElement.getAttribute('width');
         
         // remove the '%' at the end.
         // Would be good to check if there is a '%' before attempting to remove the last character
         ltaskviewwidth = ltaskviewwidth.substring(0, ltaskviewwidth.length-1);
         
	 
	 if (zoomType == 'zoomIn')
         {
           ltaskviewwidth = ltaskviewwidth / FZoom;
           }
         else if (zoomType == 'zoomOut')
         {
           ltaskviewwidth = ltaskviewwidth * FZoom;
           }
         else
           alert("Invalid zoomType parameter passed to function zoom(zoomType).");
           
         if (ltaskviewwidth < 100)
         {
             ltaskviewwidth = 100;
         }

         TaskViewElement.setAttribute('width', ltaskviewwidth + '%');
                                 
      }

      function MouseWheelZoom(mouseWheelEvent)
      {
        if (event.ctrlKey==1) {
           if (mouseWheelEvent.wheelDelta > 0)
              zoom('zoomIn');
           else
              zoom('zoomOut');
          }
        else
        {
        if (mouseWheelEvent.wheelDelta > 0)
           window.scrollBy(0, FVertScrollUp);
        else
           window.scrollBy(0, FVertScrollDown);
        }

        return false;
      }
      
 

      function ProcessKeyPress(evt)
      {
         var c = evt.keyCode;
         var ctrlDown = evt.ctrlKey; 
         
         if ((ctrlDown && c==187) || (ctrlDown && c==107)) {
             zoom('zoomOut');             
         }
         else if ((ctrlDown && c==189) || (ctrlDown && c==109)) {
             zoom('zoomIn');
         }
         else
         {
             switch (c)
             {
             case leftArrow:
                window.scrollBy(FHorzScrollLeft, 0);
                break;
             case rightArrow:
                window.scrollBy(FHorzScrollRight, 0);
                break;
             case upArrow:
                window.scrollBy(0, FVertScrollUp);
                break;
             case downArrow:
                window.scrollBy(0, FVertScrollDown);
                break;
             } // switch
         }

         return false;
      }

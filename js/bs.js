/**
#
#Copyright (c) 2011 Razortooth Communications, LLC. All rights reserved.
#
#Redistribution and use in source and binary forms, with or without modification,
#are permitted provided that the following conditions are met:
#
#    * Redistributions of source code must retain the above copyright notice,
#      this list of conditions and the following disclaimer.
#
#    * Redistributions in binary form must reproduce the above copyright notice,
#      this list of conditions and the following disclaimer in the documentation
#      and/or other materials provided with the distribution.
#
#    * Neither the name of Razortooth Communications, LLC, nor the names of its
#      contributors may be used to endorse or promote products derived from this
#      software without specific prior written permission.
#
#THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
#ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
#WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
#DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
#ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
#(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
#LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
#ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
#(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
#SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/
/** 
  * Attributions:
  * Twitter bootstrap: application.js - refactored for generic application (not sure what license applies to the original)
  */
/** 
  bs.js: Handler for general UI logic
 */
$(document).ready(function(){
  // scroll spy logic
  // ================

  var activeTarget,
      BS_DBG = false,
      $window = $(window),
      position = {},
      nav = $('body > .topbar li a'),
      targets = nav.map(function () {
        return $(this).attr('href');
      }),
      offsets = $.map(targets, function (id) {
		var anchor = $(id);
		return anchor.offset() ? anchor.offset().top: null;
      });


  function setButton(id) {
    nav.parent("li").removeClass('active');
    $(nav[$.inArray(id, targets)]).parent("li").addClass('active');
  }

  function processScroll(e) {
    var scrollTop = $window.scrollTop() + 10, i;
    for (i = offsets.length; i--;) {
      if (offsets[i] && activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1])) {
        activeTarget = targets[i];
        setButton(activeTarget);
      }
    }
  }

    /** 
     *  openTab on pill or tab
     *  targetId - the id of the div to open in the tab container
     *	parentContainer - the id of the parent container for the tab where we should look for the id	
     *  XXX This is inefficient.  We should contain the search selector to the div containing the
     *  targetId.
     */
  function openTab(targetId, parentContainer) {
	  // Find the active tab, remove active class
    // XXX Clean this up, it is inefficient
    // hide the visible content
    $(parentContainer).children().removeClass('active').find('a').each(function() {
      console.log('remove content for ' + $(this).attr('href'));
      if (this.href) $($(this).attr('href')).hide();
    });
    
    

    
    // Set the id to be active
    // $(parentContainer).children("li > a[href='" + targetId + "']").addClass('active');
    // $(parentContainer).children("a[href='" + targetId + "']").each(function() {
    $(parentContainer).find("li a[href='" + targetId + "']").each(function() {
      $(this).parent().addClass('active');
    });
	  
	  
	  // show the content in div id
    console.log('display content in div id = ' + targetId);
    $(targetId).show();
  }

  nav.click(function () {
    processScroll();
  });

  processScroll();

  $window.scroll(processScroll);

  //
  // Tab Click Handler
  //
  $("ul.pills > li a").bind("click", function(e) {
    // openTab() 
    openTab($(this).attr('href'), $(this).parent().parent()); 
    console.log('clicked on href = ' + $(this).attr('href') + ' e.target ' + e.target + ' e.type ' + e.type + ' e.currentTarget ' + e.currentTarget);
  });

  // Dropdown for topbar nav
  // ===============================

  $("body").bind("click", function(e) {
    $("ul.menu-dropdown").hide();
    $('a.menu').parent("li").removeClass("open").children("ul.menu-dropdown").hide();
  });

  $("a.menu").click(function(e) {
    var $target = $(this);
    var $parent = $target.parent("li");
    var $siblings = $target.siblings("ul.menu-dropdown");
    var $parentSiblings = $parent.siblings("li");
    if ($parent.hasClass("open")) {
      $parent.removeClass("open");
      $siblings.hide();
    } else {
      $parent.addClass("open");
      $siblings.show();
    }
    $parentSiblings.children("ul.menu-dropdown").hide();
    $parentSiblings.removeClass("open");
    return false;
  });

  // add on logic
  // ============

  $('.add-on :checkbox').click(function() {
    if ($(this).attr('checked')) {
      $(this).parents('.add-on').addClass('active');
    } else {
      $(this).parents('.add-on').removeClass('active');
    }
  });


  // Disable certain links in docs
  // If BS_DBG = true or set
  // =============================
  
    if (BS_DBG) {
      console.log('BS_DBG set, disabling basic links for tabs, pills, .pagination, alert-message');
	$('ul.tabs a, ul.pills a, .pagination a, .well .btn, .actions .btn, .alert-message .btn, a.close').click(function(e) {
	    e.preventDefault();
	});
    }

  // Copy code blocks in docs
  $(".copy-code").focus(function() {
    var el = this;
    // push select to event loop for chrome :{o
    setTimeout(function () { $(el).select(); }, 1);
  });


  // POSITION TWIPSIES
  // =================

  $('.twipsies.well a').each(function () {
    var type = this.title
      , $anchor = $(this)
      , $twipsy = $('.twipsy.' + type)

      , twipsy = {
          width: $twipsy.width() + 10
        , height: $twipsy.height() + 10
        }

      , anchor = {
          position: $anchor.position()
        , width: $anchor.width()
        , height: $anchor.height()
        }

      , offset = {
          above: {
            top: anchor.position.top - twipsy.height
          , left: anchor.position.left + (anchor.width/2) - (twipsy.width/2)
          }
        , below: {
            top: anchor.position.top + anchor.height
          , left: anchor.position.left + (anchor.width/2) - (twipsy.width/2)
          }
        , left: {
            top: anchor.position.top + (anchor.height/2) - (twipsy.height/2)
          , left: anchor.position.left - twipsy.width - 5
          }
        , right: {
            top: anchor.position.top + (anchor.height/2) - (twipsy.height/2)
          , left: anchor.position.left + anchor.width + 5
          }
      }

    $twipsy.css(offset[type])

  });

});

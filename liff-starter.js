const canvas = document.querySelector('#canvas');
const signaturePad = new SignaturePad(canvas, {
backgroundColor: 'rgb(238,238,238)',
});
      
window.onload = function() {
    canvas.setAttribute('width', $('.container').width());
    canvas.setAttribute('height', window.innerHeight - $('#btn').outerHeight() - 10);
    signaturePad.clear();

    const useNodeJS = true;   // if you are not using a node server, set this value to false
    const defaultLiffId = "";   // change the default LIFF value if you are not using a node server

    // DO NOT CHANGE THIS
    let myLiffId = "";

    // if node is used, fetch the environment variable and pass it to the LIFF method
    // otherwise, pass defaultLiffId
    if (useNodeJS) {
        fetch('/api/send-id')
            .then(function(reqResponse) {
                return reqResponse.json();
            })
            .then(function(jsonResponse) {
                myLiffId = jsonResponse.id;
                initializeLiff(myLiffId);
            })
            .catch(function(error) {
                 alert(err);
            });
    } else {
        myLiffId = defaultLiffId;
        initializeLiff(myLiffId);
    }
};

/**
* Initialize LIFF
* @param {string} myLiffId The LIFF ID of the selected element
*/
function initializeLiff(myLiffId) {
    
    liff
        .init({
          liffId: myLiffId
        })
        .then(() => {
            // start to use LIFF's api
            initializeApp();
        })
        .catch((err) => {
          alert(err);
        });
}

/**
 * Initialize the app by calling functions handling individual app components
 */
function initializeApp() {
    registerButtonHandlers();

    // check if the user is logged in/out, and disable inappropriate button
    if (!liff.isLoggedIn()) {
        liff.login();
    }
}


/**
* Register event handlers for the buttons displayed in the app
*/
function registerButtonHandlers() {
    
    document.getElementById('shareTargetPicker').addEventListener('click', function() {
        const jsonData = {
            image: signaturePad.toDataURL('image/jpeg')
        }
        $.ajax({
            type: 'POST',
            url: '/api/save',
            data: JSON.stringify(jsonData),
            contentType: 'application/json',
            dataType: "json",
            success: function (res, status) {
                liff.getProfile().then(function (profile) {
                    if(liff.isApiAvailable('shareTargetPicker')){
                        liff.shareTargetPicker([
                            {
                                type: 'image',
                                originalContentUrl: 'https://storageoekaki.blob.core.windows.net/thumbnails/' + res.name,
                                previewImageUrl: 'https://storageoekaki.blob.core.windows.net/thumbnails/' + res.name
                            },
                            {
                                type: 'text',
                                text: 'From:' + profile.displayName
                            }
                        ]).then(function () {
                        
                        }).catch(function (error) {
                            window.alert("Failed to launch ShareTargetPicker");
                        });
                    }else{
                        window.alert("Failed to launch ShareTargetPicker");
                    }
                }).catch(function (error) {
                    window.alert("Error getting profile: " + error.message);
                });
            },
            error: function (res) {
                window.alert('Error saving image: ' + res.status);
            },
            complete: function(data) {
            }
        });
    })
}
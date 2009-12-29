
( function ( $ ) {
    function Map ( options ) {
        this.options = options;
    }
    
    $.extend( Map.prototype, {
        markers: [],
        defaults: {
            marker: {
                
            }
        },
        
        panTo: function ( latlng ) {
            options.map.panTo( new google.maps.LatLng( latlng.lat, latlng.lng ) );
        },
        
        showMarker: function ( name, latlng ) {
            var position = new google.maps.LatLng( latlng.lat, latlng.lng );
            var marker = this._getMarker( name, {
                position: position,
                map: options.map,
                visible: true
            } );
        },
        
        hideMarker: function ( name ) {
            var marker = this.markers[name];
            if ( !marker ) {
                return;
            }
            marker.setVisible( false );
        },
        
        getCenter: function () {
            var latlng = this.options.map.getCenter();
            return { 
                lat: latlng.lat(),
                lng: latlng.lng()
            };
        },
        
        createMarker: function ( name, options ) {
            return this._getMarker( name, options );
        },
        
        _getMarker: function ( name, options ) {
            if ( this.markers[name] !== undefined ) {
                var marker = this.markers[name];
                marker.setOptions(options);
                return marker;
            }

            return ( this.markers[name] =
                this._createMarker( options || {} ) );
        },
        
        _createMarker: function ( options ) {
            $.extend( options, this.defaults.marker );
            
            return marker = new google.maps.Marker( options );
        }
    } );
    
    function Geocoder ( options ) {
        this.options = options;
        this._geocoder = new google.maps.Geocoder();
    }
    
    $.extend( Geocoder.prototype, {
        StatusOK: google.maps.GeocoderStatus.OK,
        
        geocode: function ( query, callback ) {
            this._geocoder.geocode( query, callback );
        },
        
        locationFromResponse: function ( response ) {
            var self = this;
            var location;
            $.each( response, function () {
                location = self.locationFromItem( this );
                if ( self.options.placepicker.isCompleteLocation( location ) ) {
                    return false;
                }
            } );
            
            return location;
        },
        
        locationFromItem: function ( responseItem ) {
            var location = {};
            
            $.each( responseItem.address_components, function () {
                var nonpol = $.grep( this.types, function ( n, i ) {
                    return n != 'political';
                } );
                if ( nonpol.length == 0 )  {
                    return true;
                }
                var type = nonpol[0];
                switch ( type ) {
                    case 'locality':
                    case 'sublocality':
                        location.city = location.city || this.long_name;
                        break;
                    case 'administrative_area_level_1':
                        location.province = this.long_name;
                        break;
                    case 'country':
                        location.country = this.long_name;
                }
            } );
            
            location.latlng = {
                lat: responseItem.geometry.location.lat(),
                lng: responseItem.geometry.location.lng()
            };
            
            return location;
        },
    } );

    $.extend( $.ui.placepicker, {
        services: {
            map: {
                google: Map
            },
            geocoder: {
                google: Geocoder
            }
        }
    } );
} )( jQuery );
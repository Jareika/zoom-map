```zoommap
  render: canvas
  imageBases:
    - path: z_Attachments/Regelbuch/Karte der Verbotenen Lande.webp
      name: Map of the Forbidden Lands
    - path: z_Attachments/Orte/Hohlheim SL.jpg
      name: Hohlheim GM
  imageOverlays:
    - path: z_Attachments/Regelbuch/Karte der Verbotenen Lande Layer.webp
      name: Layer
    - path: z_Attachments/Orte/Hohlheim Burning.webp
      name: Hohlheim GM
  # markers is optional but recommended – Standard: <image>.markers.json
  markers: z_Attachments/Regelbuch/Karte der Verbotenen Lande.jpg.markers.json
  minZoom: 0.3
  maxZoom: 20
  height: 350px       # or 60vh 
  width: 60%         # optional
  resizable: true     # optional
  align: left       # left | center | right
  wrap: true        # only left/right useful -> Text flows
  resizeHandle: native  # left | right | both | native (right)
```
# Four Dimensional Transformations
Mostly of cubes. Click on the picture below to see it in action:


[![Youtube Video](http://img.youtube.com/vi/F4igtIzGCwk/0.jpg)](http://www.youtube.com/watch?v=F4igtIzGCwk)

## But Why?

Trying to learn computer graphics, I've made a [3D "renderer" for homework](https://github.com/Zvmcevap/Canvas3d-RGTI-Homework) and decided I can finally dabble with the fourth dimension.


Obviously the main inspiration was watching [a movie](https://www.imdb.com/title/tt0285492/) at an impressionable age.
Since then 4+ dimensional space has been causing me headaches and I felt like sharing that.

## How?
### Tools at Hand
Everything gets drawn onto the HTML Canvas using Javascript. The canvas itself is refreshed every 33 milisends, to roughly correlate with 30 frames per second of a standard console game (going for that *cinematic* feel obviously).

### Getting Vertices and Edges
Objects get imported from a text file (mimicking .obj format, in theory you can import your own models if you paste the .obj contents into a .txt file).

Each row starting with "v" has 3 or 4 coordinates, seperated by a space, which maps to x,y,z and w positions in space (if a vertex only has x,y,z the Ogljisce class constructor adds a 0.5 into the w's place).

Each row starting with "f" lists the vertices that will be connected by an edge,also seperated by spaces. The last vertex in the row connects to the first one.

### The Matrix

The vertices are mapped onto the screen using a 5x5 transformation matrix, which is constructed by multiplying the scalar, rotation and translation matrices in this specific order (read from left to right):
>M<sub>T</sub> * M<sub>R</sub> * M<sub>S</sub>

In the code the first array index maps to the row number, while the second maps to the column.

### The Scalar Matrix
The Scalar Matrix with Sx, Sy, Sz, Sw, 1 on the main diagonal (one number S for each axis scaling factor) gets multiplied with the Identity Matrix.

### Rotation Matrix
Then it's multiplied by the Rotational Matrix constructed from multiplying the 6 different planes of rotation:
>R<sub>zw</sub> * R<sub>yw</sub> * R<sub>xw</sub> * R<sub>xy</sub> * R<sub>yz</sub> * R<sub>xz</sub> 

Again, from left to right, as they do.

It uses *"Euler Angles"* from what I can gather, meaning that with all the ways we can rotate, we can achieve the gimble lock on 3 rotation planes at once!

### Translation Matrix
Apologies to the English speakers, the translation matrix does, in fact, ***not*** translate my code from Slovenian into English.

But what it does do is use the fifth column to translate the position of the vertices where row 1,2,3 and for map to translation for x, y, z, and w respectively.

A shear in the higher dimension means a translation in the lower dimension.. And this way we can multiply the third time with the Translation Matrix and get our **Transformation Matrix.**

### Perspective Matrix
Optional last two steps, the transformation matrix can be multiplied by a perspective matrix, adding "depth" based on the distance of the object from the z and w axis, seperately.

Basically both x and y get **multiplied** by distance of the projection surface , **devided** by the distance of the vertices from 0 point on the axis.

## Controls
### Upload File button:
Can be used to load a different object from a .txt file. You can in theory paste in any .obj information into the text file and it *should* load correctly.

### Most buttons are colour coded based on the axis they effect:
- **Red** - X-axis
- **Green** - Y-axis
- **Blue** - Z-axis
- **Purple** - W-axis

*Of course, for rotation they don't map quite as well, basically for the 3D rotations we know the most, they get map to whichever axis they turn around, the other three rotation we get in 4D space I have assigned in-between colours based on the RGB specter. Hope it works :)*

### The radio buttons decide what kind of transformation gets applied to the buttons:
- **Premik** - Translation
- **Rotacija** - Rotation (heh)
- **Povečava** - Scaling

### Nariši Checkboxes decides what get's drawn to the Canvas:
- **Oglišča** - draws vertices
- **Povezave** - draws edges
- **Koordinate** - draws the post-transformation coordinates
- **VektorjiXYZW** - draws a vektor from the origin to a vertex at the far end of each of the main axis, to better show how perpendicular vectors get drawn from 4D to 2D.

### Perspektiva:

Controls if the perspective for either z or w axis is applied, the z-daleko and w-daleko control how far the projection surface is from **"The Eye"**.


#### ++Buttons:

Toggle buttons that raises the value of the appropriate transformation type based both on the radio buttons settings and their repective colour. The value increase happens every 33 miliseconds.


![alt text](https://github.com/Zvmcevap/CanvasExtraD/blob/master/Controls.png "Pic of the controls I hope")
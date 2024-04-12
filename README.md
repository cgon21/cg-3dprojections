# 3D Projections & Clipping for Wireframe Rendering

3D Projections & Clipping starter code using the HTML5 Canvas 2D API

---

## Vector Class API
Code includes file `matrix.js` used to create vectors and matrices

---


### Constructor
`Vector(n)`

Creates a new vector of length *n* with 0's everywhere

**Example**

`let v = new Vector(3);`

**Result:**

$$v = \begin{bmatrix}0\\\0\\\0\end{bmatrix}$$

---


### Member variables
`x`<br/>
first component of vector

`y`<br/>
second component of vector (null if less than 2 components)

`z`<br/>
third component of vector (null if less than 3 components

`w`<br/>
fourth component of vector (null if less than 4 components

---

### Methods
`magnitude()`

Returns the magnitude of the vector

**Example:**
```
let v = new Vector(3);
v.values = [2, 1, -5];
let mag = v.magnitude();
```

**Result:**

$$mag = 5.477226$$

---

`normalize()`

normalizes the vector (i.e. makes its magnitude 1.0)

**Example:**
```
let v = new Vector(3);
v.values = [2, 1, -5];
v.normalize();
```

**Result:**

$$v = \begin{bmatrix}0.365148\\\0.182574\\\ -0.912871\end{bmatrix}$$

---

`scale(scalar)`

scales the vector by a scalar

**Example:**
```
let v = new Vector(3);
v.values = [2, 1, -5];
v.scale(2);
```

**Result:**

$$v = \begin{bmatrix}4\\\2\\\ -10\end{bmatrix}$$

---

`add(rhs)`

Returns a new vector that adds the vector by another vector (rhs)

**Example:**
```
let v1 = new Vector(3);
let v2 = new Vector(3);
v1.values = [2, 1, -5];
v2.values = [6, -4, 9];
let v3 = v1.add(v2);
```

**Result:**

$$v3 = \begin{bmatrix}8\\\ -3\\\4\end{bmatrix}$$

---

`subtract(rhs)`

Returns a new vector that subtracts another vector (rhs) from the vector

**Example:**
```
let v1 = new Vector(3);
let v2 = new Vector(3);
v1.values = [2, 1, -5];
v2.values = [6, -4, 9];
let v3 = v1.subtract(v2);
```

**Result:**

$$v3 = \begin{bmatrix}-4\\\5\\\ -14\end{bmatrix}$$

---

`dot(rhs)`

Returns the dot product between the vector and another vector (rhs)

**Example:**
```
let v1 = new Vector(3);
let v2 = new Vector(3);
v1.values = [2, 1, -5];
v2.values = [6, -4, 9];
let d = v1.dot(v2);
```

**Result:**

$$d = -37$$

---

`cross(rhs)`

Returns the cross product between the vector and another vector (rhs)

**Example:**
```
let v1 = new Vector(3);
let v2 = new Vector(3);
v1.values = [2, 1, -5];
v2.values = [6, -4, 9];
let v3 = v1.cross(v2);
```

**Result:**

$$v3 = \begin{bmatrix}-11\\\ -48\\\ -14\end{bmatrix}$$

---


## Matrix Class API
Code includes file `matrix.js` used to create vectors and matrices

---


### Constructor
`Matrix(m, n)`

Creates a new *m×n* matrix (`m` rows and `n` columns) with 1's on the diagonal and 0's everywhere else

**Example:**

`let t = new Matrix(3, 3);`

**Result:**

$$t = \begin{bmatrix}1 & 0 & 0\\\0 & 1 & 0\\\0 & 0 & 1\end{bmatrix}$$

---


### Member variables
`rows` -- read only<br/>
number of rows in matrix

`columns` -- read only<br/>
number of columns in matrix

`values`<br/>
2D array of matrix values (can also set values using 1D array of length *m×n*)

**Example:**

```
t.values = [[1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]];
```
```
t.values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
```

**Result:**

$$t = \begin{bmatrix}1 & 2 & 3\\\4 & 5 & 6\\\7 & 8 & 9\end{bmatrix}$$

---


### Class Methods
`multiply(matrices)`

Mutliplies matrices (where `matrices` is an array of two or more `Matrix` objects). Returns `null` if matrices cannot be multiplied.

**Example:**
```
let t1 = new Matrix(3, 3);
t1.values = [[1, 0, -5],
             [0, 1, 10],
             [0, 0, 1]];
let t2 = new Matrix(3, 3);
t2.values = [[2, 0, 0],
             [0, 4, 0],
             [0, 0, 1]];
let t = Matrix.multiply([t2, t1]);
```

**Result:**

$$t = \begin{bmatrix}2 & 0 & -10\\\0 & 4 & 40\\\0 & 0 & 1\end{bmatrix}$$

---


### Methods
`determinant()`

Returns the determinant of the matrix (result is `null` if the determinant cannot be calculated)

**Example:**
```
let t = new Matrix(3, 3);
t.values = [[2, 0, -5],
            [0, 4, 10],
            [0, 0, 1]];
let det = t.determinant()
```

**Result:**

$$det = 8$$

---


`transpose()`

Returns the transpose of the matrix

**Example:**
```
let t = new Matrix(3, 3);
t.values = [[2, 0, -5],
            [0, 4, 10],
            [0, 0, 1]];
let t_tran = t.transpose()
```

**Result:**

$$t\\_tran = \begin{bmatrix}2 & 0 & 0\\\0 & 4 & 0\\\ -5 & 10 & 1\end{bmatrix}$$

---


`inverse()`

Returns the inverse of the matrix (result is `null` if the inverse cannot be calculated)

**Example:**
```
let t = new Matrix(3, 3);
t.values = [[2, 0, -5],
            [0, 4, 10],
            [0, 0, 1]];
let t_inv = t.inverse()
```

**Result:**

$$t\\_inv = \begin{bmatrix}0.5 & 0 & 2.5\\\0 & 0.25 & -2.5\\\0 & 0 & 1\end{bmatrix}$$

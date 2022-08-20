let favicon = document.getElementById('favicon')
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  favicon.href = './img/favicon-light.ico'
} else {
  favicon.href = './img/favicon-dark.ico'
}
favicon = undefined

let BST = null
const leftBarTableBody = document.getElementById('leftBarTableBody')
const Map = document.getElementById('map')
const nodeContainer = document.getElementById('nodeContainer')
let nodeCanvas = null
const refreshBSTButton = document.getElementById('refreshBSTButton')
const resetMapButton = document.getElementById('resetMapButton')
const spinnerWrapper = document.getElementById('spinnerWrapper')
spinnerWrapper.addEventListener('click', e => {
  e.preventDefault()
})

const height = node => {
  if (node == null) return 0
  else {
    let lHeight = height(node.left)
    let rHeight = height(node.right)
    if (lHeight > rHeight) return lHeight + 1
    else return rHeight + 1
  }
}

const breadthTraverse = (callBack, bst) => {
  const runCB = (node, level) => {
    if (node == null) return
    if (level == 1) callBack(node)
    else if (level > 1) {
      runCB(node.left, level - 1)
      runCB(node.right, level - 1)
    }
  }

  let h = height(bst)
  for (let i = 1; i <= h; i++) runCB(bst, i)
}

const traverse = (callBack, node, order) => {
  if (node !== null) {
    const func = {
      tl: () => traverse(callBack, node.left, order),
      cb: () => callBack(node),
      tr: () => traverse(callBack, node.right, order),
      bf: () => breadthTraverse(callBack, node),
    }

    for (const pointer of order) {
      func[pointer]()
    }
  }
}

const traverseOrder = order => {
  switch (order) {
    case 'inOrder':
      return ['tl', 'cb', 'tr']
    case 'preOrder':
      return ['cb', 'tl', 'tr']
    case 'postOrder':
      return ['tl', 'tr', 'cb']
    case 'breadthFirst':
      return ['bf']
    default:
      return ['tl', 'cb', 'tr']
  }
}

const createVisualNode = (node, index) => {
  node.element = document.createElement('div')
  node.element.id = `node-${index}`
  node.element.classList.add('node')
  node.element.innerHTML = `<div class="node-content${node.rlr === 'ROOT' ? ' highlightRoot' : ''}">
    <div class="node-key">${node.key}</div>
    <div class="node-val">${node.val}</div>
  </div>`
  nodeContainer.appendChild(node.element)
}

const fillTable = (node, index) => {
  leftBarTableBody.innerHTML += `<tr id="${'tBodyTr-' + index}" class="tBodyTr${node.rlr === 'ROOT' ? ' highlightRoot' : ''}"><td>${node.dpt}-${node.rlr}</td><td>${node.key}</td><td>${node.val}</td></tr>`
}

const createHoverLinks = () => {
  Array.from(document.querySelectorAll('.tBodyTr')).forEach(el => {
    const node = document.getElementById(`node-${el.id.split('-')[1]}`)
    el.addEventListener('mouseenter', e => node.classList.add('tableToNode'))
    el.addEventListener('mouseleave', e => node.classList.remove('tableToNode'))
  })

  Array.from(document.querySelectorAll('.node')).forEach(el => {
    const node = document.getElementById(`tBodyTr-${el.id.split('-')[1]}`)
    el.addEventListener('mouseenter', e => node.classList.add('nodeToTable'))
    el.addEventListener('mouseleave', e => node.classList.remove('nodeToTable'))
  })
}

const reloadBST = async () => {
  spinnerWrapper.style.visibility = 'visible'
  leftBarTableBody.innerHTML = ''
  nodeContainer.innerHTML = ''
  const res = await fetch('http://localhost:3406/bst')
  BST = await res.json()

  let index = 0
  let parentNode = null
  traverse(
    node => {
      fillTable(node, ++index)
      createVisualNode(node, index)

      const findParentNode = () => {
        try {
          traverse(
            n => {
              if (node.parent === n.key) {
                parentNode = n
                throw 'node found'
              }
            },
            BST,
            traverseOrder('inOrder')
          )
        } catch (e) {
          // 'node found'
        }
      }

      let topStyle = ''
      let leftRightStyle = 0
      if (node.rlr !== 'ROOT') {
        findParentNode()
        const legLength = {
          left: height(parentNode.left),
          right: height(parentNode.right),
          max: () => Math.max(legLength.left, legLength.right),
        }
        let legBuffer = 0
        let { left } = parentNode.element.style
        left = parseInt(left.replace(left.includes('calc(50% - ') ? 'calc(50% - ' : 'calc(50% + ', '').replace('px)', ''))

        legBuffer = legLength.max() * 60
        topStyle = topStyle === 0 ? legLength.max() * 60 : topStyle
        leftRightStyle = {
          left: `calc(50% - ${left + legBuffer}px)`,
          right: `calc(50% - ${left - legBuffer}px)`,
        }
      }

      switch (node.rlr) {
        case 'L':
          node.element.style.top = String(80 * node.dpt + topStyle)
          node.element.style.left = leftRightStyle.left
          break
        case 'R':
          node.element.style.top = String(80 * node.dpt + topStyle)
          node.element.style.left = leftRightStyle.right
          break
        case 'ROOT':
          node.element.style.top = `111 - 50`
          node.element.style.left = `calc(50% - 50px)`
          break
      }
    },
    BST,
    traverseOrder('breadthFirst')
  )

  traverse(
    node => {
      //drawLineXY(fromXY, toXY)
      // console.log(node.element.offsetTop, node.element.offsetLeft)

      const fromXY = {
        x: node.element.offsetLeft,
        y: node.element.offsetTop,
      }
      if (node.left !== null) {
        const toXY = {
          x: node.left.element.offsetLeft,
          y: node.left.element.offsetTop,
        }
        drawLineXY(fromXY, toXY)
      }

      if (node.right !== null) {
        const toXY = {
          x: node.right.element.offsetLeft,
          y: node.right.element.offsetTop,
        }
        drawLineXY(fromXY, toXY)
      }
    },
    BST,
    traverseOrder('preOrder')
  )

  createHoverLinks()
  dragElement(Map)
  spinnerWrapper.style.visibility = 'hidden'
}

;(async () => {
  await reloadBST()
})()

refreshBSTButton.addEventListener('click', async () => {
  await reloadBST()
})

resetMapButton.addEventListener('click', async () => {
  Map.style.top = null
  Map.style.left = null
  Map.style.transform = null
})

let scale = 1
Map.addEventListener('wheel', e => {
  e.preventDefault()

  scale += e.deltaY > 0 ? -0.1 : 0.1
  scale = Math.min(Math.max(0.125, scale), 4)
  Map.style.transform = `scale(${scale})`
})

// below is borrowed code from https://www.w3schools.com/howto/howto_js_draggable.asp
function dragElement(map) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0

  map.onmousedown = dragMouseDown

  function dragMouseDown(e) {
    e = e || window.event
    e.preventDefault()
    // get the mouse cursor position at startup:
    pos3 = e.clientX
    pos4 = e.clientY
    document.onmouseup = closeDragElement
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag
    map.style.cursor = 'grabbing'
  }

  function elementDrag(e) {
    e = e || window.event
    e.preventDefault()
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX
    pos2 = pos4 - e.clientY
    pos3 = e.clientX
    pos4 = e.clientY
    // set the element's new position:
    map.style.top = map.offsetTop - pos2
    map.style.left = map.offsetLeft - pos1
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null
    document.onmousemove = null
    map.style.cursor = 'grab'
  }
}

// below is borrowed code from https://stackoverflow.com/questions/22615338/drawing-lines-between-2-elements-onclick
function drawLineXY(fromXY, toXY) {
  console.log(fromXY, toXY)
  if (!nodeCanvas) {
    nodeContainer.innerHTML += '<canvas class="nodeCanvas"></canvas>'
    nodeCanvas = document.querySelector('.nodeCanvas')
    nodeCanvas.width = nodeContainer.offsetWidth
    nodeCanvas.height = 10000
  }
  var leftpoint, rightpoint
  if (fromXY.x < toXY.x) {
    leftpoint = fromXY
    rightpoint = toXY
  } else {
    leftpoint = toXY
    rightpoint = fromXY
  }

  var lineWidthPix = 4
  var gutterPix = 10
  var origin = { x: leftpoint.x - gutterPix, y: Math.min(fromXY.y, toXY.y) - gutterPix }
  // nodeCanvas.width = Math.max(rightpoint.x - leftpoint.x, lineWidthPix) + 2.0 * gutterPix
  // nodeCanvas.height = Math.abs(fromXY.y - toXY.y) + 2.0 * gutterPix
  nodeCanvas.style.left = origin.x
  nodeCanvas.style.top = origin.y
  var ctx = nodeCanvas.getContext('2d')
  // Use the identity matrix while clearing the canvas
  ctx.save()
  // ctx.setTransform(1, 0, 0, 1, 0, 0)
  // ctx.clearRect(0, 0, nodeCanvas.width, nodeCanvas.height)
  ctx.restore()
  ctx.lineWidth = 4
  ctx.strokeStyle = '#09f'
  ctx.beginPath()
  ctx.moveTo(fromXY.x - origin.x, fromXY.y - origin.y)
  ctx.lineTo(toXY.x - origin.x, toXY.y - origin.y)
  ctx.stroke()
}

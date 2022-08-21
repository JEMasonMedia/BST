let favicon = document.getElementById('favicon')
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  favicon.href = './public/img/favicon-light.png'
} else {
  favicon.href = './public/img/favicon-dark.png'
}
favicon = undefined

const leftBarTableBody = document.getElementById('leftBarTableBody')
const Map = document.getElementById('map')
const numberNodesSelect = document.getElementById('numberNodesSelect')
let numberNodes = null
const refreshBSTButton = document.getElementById('refreshBSTButton')
const resetMapButton = document.getElementById('resetMapButton')
const spinnerWrapper = document.getElementById('spinnerWrapper')
spinnerWrapper.addEventListener('click', e => {
  e.preventDefault()
})

let cytoscapeMap = null
let BSTobject = null

numberNodes = numberNodesSelect.value

const createBST = () => {
  const bstArray = {}

  for (var i = 0; i < numberNodes; ++i) {
    const getString = () => {
      let string = ''
      for (var j = 0; j < 5; ++j) {
        string += String.fromCharCode(BetterRandom(66, 90))
      }
      return string
    }

    const getRandom = () => {
      while (true) {
        const random = BetterRandom(10000, 65535)
        if (!bstArray[random]) {
          bstArray[random] = getString()
          return [String(random), bstArray[random]]
        }
      }
    }

    let [key, val] = getRandom()
    BSTobject.insertNode(key, val)
  }
}

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

const fillTable = node => {
  leftBarTableBody.innerHTML += `<tr id="${'tBodyTr-' + node.key}" class="tBodyTr${node.rlr === 'ROOT' ? ' highlightRoot' : ''}"><td>${node.dpt}-${node.rlr}</td><td>${node.key}</td><td>${node.val}</td></tr>`
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

const createVisualNode = (node, elements) => {
  elements.nodes.push({ data: { id: `#node${node.key}`, text: `${node.key}\n${node.val}`, color: node.rlr === 'ROOT' ? 'rgb(0, 255, 0)' : 'whitesmoke' } })
  if (node.left !== null) elements.edges.push({ data: { source: `#node${node.key}`, target: `#node${node.left.key}` } })
  if (node.right !== null) elements.edges.push({ data: { source: `#node${node.key}`, target: `#node${node.right.key}` } })
}

const reloadBST = async () => {
  spinnerWrapper.style.visible = 'visible'
  leftBarTableBody.innerHTML = ''

  BSTobject = new BST()
  createBST()
  const bst = BSTobject.root

  let selectors = [
    {
      selector: 'node',
      style: {
        'background-color': 'rgba(255, 0, 0, 0.3)',
        height: 50,
        width: 50,
        'border-color': '#000',
        'border-width': 2,
        'border-opacity': 0.5,
        'font-family': 'Roboto Mono, monospace',
        'text-wrap': 'wrap',
        'text-halign': 'center',
        'text-valign': 'center',
        'text-transform': 'uppercase',
        'font-size': '12px',
        label: 'data(text)',
        color: 'data(color)',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 1,
        'target-arrow-shape': 'triangle',
        'line-color': 'black',
        'target-arrow-color': 'black',
        'curve-style': 'bezier',
      },
    },
  ]
  let elements = {
    nodes: [],
    edges: [],
  }

  traverse(
    node => {
      fillTable(node)
      createVisualNode(node, elements)
    },
    bst,
    traverseOrder('breadthFirst')
  )

  cytoscapeMap = cytoscape({
    container: Map,

    boxSelectionEnabled: false,
    autounselectify: true,

    layout: {
      // name: 'cose-bilkent',
      name: 'dagre',
      animate: 'end',
      animationEasing: 'ease-in-out',
      animationDuration: 2000,
      randomize: true,
    },

    style: selectors,
    elements: elements,
  })

  // createHoverLinks()
  spinnerWrapper.style.visible = 'hidden'
}

;(async () => {
  await reloadBST()
})()

refreshBSTButton.addEventListener('click', async () => {
  await reloadBST()
})

resetMapButton.addEventListener('click', async () => {
  cytoscapeMap.reset()
  cytoscapeMap.fit()
})

numberNodesSelect.addEventListener('change', async e => {
  numberNodes = e.target.value
  await reloadBST()
})

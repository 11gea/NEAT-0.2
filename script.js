canvas = document.getElementById('canvas')
ctx = canvas.getContext("2d")

const numInNodes = 2, numOutNodes = 1, times = [], groups = [],
  genes = [/*idk yet*/],
  random = (max, min) => Math.random() * (max - min) + min,
  abs = (a) => Math.abs(a)

var screenx = 0, screeny = 0, agentList = [], hafx = 0, hafy = 0

let i = 10
while (i--) {
  groups[0].push(agentList.length)
  agentList.push(createAgent())
}

function addGroup(groupIndex, item) {
  if (groups[groupIndex] == null) {
    groups.push([item])
  } else {
    groups[]
  }
}

function mainloop() {
  // update canvas
  windowInfo()
  text(10 - hafx, hafy - 20, `FPS: ${getFps()}`, 20, "black")
  train()
  request = requestAnimationFrame(mainloop)
}

mainloop()

function train() {
  let i = groups.length
  while (i--) {
    let currentGroup = groups[i]
    let j = currentGroup.length
    let len = j / 2
    while (j--) {
      score = abs(runAgent([1, 0], currentGroup[j]))
      agentList[currentGroup[j]][0] = score
      text(-100, (j - len) * 20, `${j} : ${score}`, 20, "black")
    }
    // agentList = mergeSort(agentList)
  }
}

function mutate(list, length) {
  //
}

function createAgent() {
  let nodes = [], backLinks = [], weights, probWeights = [], allNodes = [],
    // create list of previous nodes
    i = numInNodes
  while (i--) {
    backLinks.push(i)
  }
  // input nodes don't contain any info
  // for every output node, create a list of weights for the links
  i = numOutNodes
  while (i--) {
    weights = []
    let j = numInNodes
    while (j--) {
      weights.push(random(5, -5))
    }
    // add the previous links, weights, bais, and function #0-1
    nodes[i + numInNodes] = [backLinks, weights, random(5, -5), ~~random(0, 2)]
  }
  // make probability list for weight mutation
  i = numInNodes
  while (i--) {
    probWeights.push(numInNodes)
  }
  for (i = 0; i < numOutNodes + numInNodes; i++) {
    // add all nodes for bais / function mutation probability list
    allNodes.push(i)
  }
  // return score place holder, nodes((back links), (weights), bais, function), weight nodes list, all nodes
  return [0, nodes, probWeights, allNodes]
}

function runAgent(inputs, a) {
  let output = []
  let sums = []
  let nodes = agentList[a][1]
  // sums stores the sum of a node, nodes is the current agent's nodes
  // set the sums of the input nodes to the inputs
  let i = numInNodes
  while (i--) {
    sums[i] = inputs[i]
  }
  // get the sum of very output node
  i = numOutNodes
  while (i--) {
    output.push(sumNode(numInNodes + i, sums, nodes))
  }
  return output
}

function sumNode(node, sums, nodes) {
  if (sums[node] != null) {
    /* if the sums node has a sum, return the sum to prevent calculating
    the same node again*/
    return sums[node]
  } else {
    let sum = nodes[node][2]
    let backLinks = nodes[node][0]
    let weights = nodes[node][1]
    let activation = nodes[node][3]
    let i = backLinks.length
    // initialize the node sum as the bais, backlinks, weights, etc.
    //for every child node, add their sum * connection weight to the current nodes sum
    while (i--) {
      sum += sumNode(backLinks[i], sums, nodes) * weights[i]
    }
    // for the differnt activation functions
    if (activation === 0) {
      sum = sum > 8 ? 1 : sum < -8 ? -1 : sum / 8
    } else {
      sum = sum > 8 ? 1 : sum < -8 ? -1 : sum < 0 ?
        0 - abs(sum) ** (1 / 3) / 2 : sum ** (1 / 3) / 2
    }
    sums[node] = sum
    return sum
  }
}

//  merge sort, except the items they are comparing are the first item of each agent(their score) in the agent list
function mergeSort(arr) {
  let len = arr.length
  if (len < 2) {
    return arr
  }
  let middle = ~~(len / 2)
  return merge(mergeSort(arr.slice(0, middle)),
    mergeSort(arr.slice(middle)))
}

function merge(left, right) {
  let result = [], i = 0, j = 0
  while (i < left.length && j < right.length) {
    // compare agent scores
    if (left[i][0] < right[j][0]) {
      result.push(left[i++])
    } else {
      result.push(right[j++])
    }
  }
  return result.concat(left.slice(i)).concat(right.slice(j))
}

function windowInfo() {
  // update and clear screen dimensions
  if ((window.innerWidth !== screenx) || (window.innerHeight !== screeny)) {
    screenx = window.innerWidth
    screeny = window.innerHeight
    hafx = screenx / 2
    hafy = screeny / 2
    document.getElementById('canvas').width = screenx
    document.getElementById('canvas').height = screeny
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

// self explanotory
function text(x, y, t, s, c) {
  ctx.font = `${s}px Sans`
  ctx.fillStyle = c
  ctx.fillText(t, x + hafx, hafy - y)
}

// same here
function getFps() {
  now = performance.now()
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift()
  }
  times.push(now)
  return times.length
}
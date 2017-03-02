/**
 * Created by ashamsutdinov on 02.03.2017.
 */
/*
 * Copyright (c) 2008-2015, Compass Plus Limited. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. This Source Code is distributed
 * WITHOUT ANY WARRANTY; including any implied warranties but not limited to
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Mozilla Public License, v. 2.0. for more details.
 */

// Some style constants (use in attributes)
var IS_ELEMENTS_MOVABLE = false;
var IS_Z_INDEX_ALTERABLE = true;
var MAIN_SCALE = 1.1;
var PAPER_SCALE = 2;

// links will be bent at the right angle
// if offset of elements centers is more than this constant
var LINK_BENDER_MARGIN = 30; // px

var REF_STROKE_WIDTH = .5;
var REF_COLOR = '#4169E1';

var TABLE_NAME_RECT_COLOR = '#DDEFFD';

var LABEL_COLOR = 'white';

var TABLE_COLUMNS_TITLE_RECT_COLOR = '#FFF1D5';
var TABLE_COLUMNS_RECT_COLOR = '#FFFAF0';

var TABLE_INDICIES_TITLE_RECT_COLOR = '#FFF1D5';
var TABLE_INDICIES_RECT_COLOR = '#FFFAF0';

var TABLE_TRIGGERS_TITLE_RECT_COLOR = '#FFF1D5';
var TABLE_TRIGGERS_RECT_COLOR = '#FFFAF0';

var TABLE_STROKE_WIDTH = .25;
var TABLE_STROKE_COLOR = 'black';

// ------ FOR BETTER LIFE - DON'T ALTER! ------
// Base independent parameters
var FONT_FAMILY = 'Monospace';
var TABLE_TITLE_FONT_SIZE = 14;
var TABLE_SUBTITLE_FONT_SIZE = 12;
var TABLE_FIELDS_FONT_SIZE = 11;

// in px
// This constants are depended from font constants
// (FONT_FAMILY, TABLE_TITLE_FONT_SIZE, TABLE_SUBTITLE_FONT_SIZE, TABLE_FIELDS_FONT_SIZE)
var BASE_ELEMENT_WIDTH = 60;
var SCROLLER_PADDING = 10;
var TITLE_HEIGHT = 24;
var FIELD_HEIGHT = 11;
var LINES_VERT_PADDING = 8;

// FIELDS_CHARS_CAPACITY - capacity of common line in characters at 'Consolas' with 14 size
// FIELDS_CHARS_WEIGHT - weight in pixels of one character at 'Consolas' with 14 size
// TITLE_CHARS_CAPACITY - capacity of element title line in characters at 'Consolas' with 18 size
// TITLE_CHARS_WEIGHT - weight in pixels of one character at 'Consolas' with 18 size
// This constants are depended from font constants (FONT_FAMILY, TABLE_TITLE_FONT_SIZE and TABLE_FIELDS_FONT_SIZE)
var FIELDS_CHARS_CAPACITY = 8;
var FIELDS_CHARS_WEIGHT = 7;
var TITLE_CHARS_CAPACITY = 7;
var TITLE_CHARS_WEIGHT = 8;
// -----/ FOR BETTER LIFE - DON'T ALTER! /-----

var TABLE_FONT_COLOR = 'black';
var TABLE_SHORTCUT_NAME_RECT_COLOR = '#EBEBEB ';
var TABLE_VIEW_NAME_RECT_COLOR = '#E1FFE1';
var SEQ_NAME_RECT_COLOR = '#FFD6AA';

var _links = [];

var wedgeProduct = function(vectorA, vectorB) {
    return vectorA.x * vectorB.y - vectorA.y * vectorB.x;
};

var getRectCorners = function(rect) {
    return {	topLeft: 	{ 	x: rect.attributes.position.x,
        y: rect.attributes.position.y
    },
        topRight: 	{ 	x: rect.attributes.position.x + rect.getWidth(),
            y: rect.attributes.position.y
        },
        botRight: 	{ 	x: rect.attributes.position.x + rect.getWidth(),
            y: rect.attributes.position.y + rect.getHeight()
        },
        botLeft: 	{ 	x: rect.attributes.position.x,
            y: rect.attributes.position.y + rect.getHeight()
        }
    };
};

var normalize = function(obj, normal) {
    obj.x -= normal.x;
    obj.y -= normal.y;
};

var normalizeCorners = function(corners, normal) {
    normalize(corners.topLeft, normal);
    normalize(corners.topRight, normal);
    normalize(corners.botRight, normal);
    normalize(corners.botLeft, normal);
};

var checkDirection = function(source, target) {
    var sourceCenter = getRectCenter(source);

    var sourceCorners = getRectCorners(source);
    var targetCorners = getRectCorners(target);
    // normalize coordinates
    normalizeCorners(targetCorners, sourceCenter);
    normalizeCorners(sourceCorners, sourceCenter);

    if(wedgeProduct(sourceCorners.topLeft, targetCorners.botLeft) < 0 &&
        wedgeProduct(sourceCorners.topRight, targetCorners.botRight) > 0) {
        return 'bottom';
    } else if(wedgeProduct(sourceCorners.topRight, targetCorners.topLeft) < 0 &&
        wedgeProduct(sourceCorners.botRight, targetCorners.botLeft) > 0) {
        return 'left';
    } else if(wedgeProduct(sourceCorners.botRight, targetCorners.topRight) < 0 &&
        wedgeProduct(sourceCorners.botLeft, targetCorners.topLeft) > 0) {
        return 'top';
    } else if(wedgeProduct(sourceCorners.botLeft, targetCorners.botRight) < 0 &&
        wedgeProduct(sourceCorners.topLeft, targetCorners.topRight) > 0) {
        return 'right';
    }
};

var getRectCenter = function(obj) {
    return 	{ 	x: obj.attributes.position.x + obj.getWidth() / 2,
        y: obj.attributes.position.y + obj.getHeight() / 2
    };
};

var routeLink = function(paper, graph, link) {
    var source = getElementById(graph, link.attributes.source.dbId);
    var target = getElementById(graph, link.attributes.target.dbId);

    var sourceCenter = getRectCenter(source);

    var targetCenter = getRectCenter(target);

    var offset = { 	x: 	targetCenter.x - sourceCenter.x,
        y: 	targetCenter.y - sourceCenter.y
    };

    if( Math.abs(offset.x) < LINK_BENDER_MARGIN ||
        Math.abs(offset.y) < LINK_BENDER_MARGIN) {
        return;
    }

    var bendPoints = { 	source: { x: {}, y: {} },
        target: { x: {}, y: {} }
    };

    var direction = checkDirection(source, target);

    switch(direction) {
        case 'top':
            bendPoints.source.x = sourceCenter.x;
            bendPoints.source.y = source.attributes.position.y - LINK_BENDER_MARGIN;
            bendPoints.target.x = targetCenter.x;
            bendPoints.target.y = target.attributes.position.y + target.getHeight() + LINK_BENDER_MARGIN;
            break;
        case 'right':
            bendPoints.source.x = source.attributes.position.x + source.getWidth() + LINK_BENDER_MARGIN;
            bendPoints.source.y = sourceCenter.y;
            bendPoints.target.x = target.attributes.position.x - LINK_BENDER_MARGIN;
            bendPoints.target.y = targetCenter.y;
            break;
        case 'bottom':
            bendPoints.source.x = sourceCenter.x;
            bendPoints.source.y = source.attributes.position.y + source.getHeight() + LINK_BENDER_MARGIN;
            bendPoints.target.x = targetCenter.x;
            bendPoints.target.y = target.attributes.position.y - LINK_BENDER_MARGIN;
            break;
        case 'left':
            bendPoints.source.x = source.attributes.position.x - LINK_BENDER_MARGIN;
            bendPoints.source.y = sourceCenter.y;
            bendPoints.target.x = target.attributes.position.x + target.getWidth() + LINK_BENDER_MARGIN;
            bendPoints.target.y = targetCenter.y
    }

    addVertex(paper, link, bendPoints.target);
    addVertex(paper, link, bendPoints.source);
};



var addVertex = function(paper, link, vertex) {
    link.findView(paper).addVertex( { x: vertex.x, y: vertex.y } );
};

// Binds collected links (var _links) and adds HTML-links to fields + delete special separator '@
var bindLinks = function() {
    var textArr = $('text:contains(\"@\")');
    for(var i = 0; i < textArr.length; i++) {
        if($(textArr[i]).has("tspan").length == 0) {
            var inner = $(textArr[i]).text();
            $(textArr[i]).html("<tspan dy=\"0em\" x=\"0\"class=\"line\">" + inner + "</tspan>");
        }
    }
    var tspanArr = $('tspan:contains(\"@\")');
    for(var i = 0; i < tspanArr.length; i++) {
        var body = $(tspanArr[i]).text().split('@')[0];
        var link = _links[i];
        if(link != undefined) {
            $(tspanArr[i]).html('<a xlink:href=\"' + link + '\" xlink:show=\"new\" cursor=\"pointer\">' + body + '</a>');
        } else {
            $(tspanArr[i]).html(body);
        }
    }
};

var getElementById = function(graph, id) {
    var elements = graph.getElements();
    var answer;
    for(var i = 0; i < elements.length; i++) {
        if (elements[i].attributes.dbId == id) {
            answer = elements[i];
            break;
        }
    }
    return answer;
};

// Automatically build diagram by input JSON-message with
// information about tables, views, references and etc.
// autoPlacement - flag, if set true, elements are placed on the virtual grid
function buildDiagram(jsonData, elementName, autoPlacement) {

    var view = joint.dia.LinkView.extend( {
        mouseover: function(evt, x, y) {
        },

        mouseout: function() {
        }
    });

    var graph = new joint.dia.Graph;
    var mainPaper = new joint.dia.Paper({
        gridSize: 1,
        model: graph,
        interactive: IS_ELEMENTS_MOVABLE,
        linkView: view
    });

    var paperScroller = new joint.ui.PaperScroller({
        autoResizePaper: true,
        paper: mainPaper
    });

    mainPaper.on('blank:pointerdown', paperScroller.startPanning);
    paperScroller.$el.css({
        width: $(window).width() - SCROLLER_PADDING,
        height: $(window).height() - SCROLLER_PADDING
    });

    $('#' + elementName).append(paperScroller.render().el);
    paperScroller.center();

    window.onresize = function(evt) {
        paperScroller.$el.css({
            width: $(window).width() - SCROLLER_PADDING,
            height: $(window).height() - SCROLLER_PADDING
        });
    };

    // Automatic invokes toFront() when user clicks down on the element/link
    if(IS_Z_INDEX_ALTERABLE) {
        mainPaper.on('cell:pointerdown', function(cellView, evt, x, y) {

            var elements = this.model.getElements();

            for(var i = 0; i < elements.length; i++) {
                if(elements[i].findView(mainPaper) == cellView) {
                    elements[i].toFront();
                    break;
                }
            }

            var links = this.model.getLinks();

            for(var i = 0; i < links.length; i++) {
                if(links[i].findView(mainPaper) == cellView) {
                    links[i].toFront();
                    break;
                }
            }
        });
    }

    var allElements = [];

    _.each(jsonData.tables, function(table) {
        allElements.push( {data: table, type: 'table'} );
    });
    _.each(jsonData.views, function(view) {
        allElements.push( {data: view, type: 'view'} );
    });
    _.each(jsonData.shortcuts, function(shortcut) {
        allElements.push( {data: shortcut, type: 'shortcut'} );
    });
    _.each(jsonData.sequences, function(sequence) {
        allElements.push( {data: sequence, type: 'sequence'} );
    });
    _.each(jsonData.labels, function(label) {
        allElements.push( {data: label, type: 'label'} );
    });

    // Placement
    for(var index = 0; index < allElements.length; index++) {
        var element = allElements[index].data;
        element.position.x = element.position.x * MAIN_SCALE;
        element.position.y = element.position.y * MAIN_SCALE;

        var current;

        switch(allElements[index].type) {
            case 'table':
                current = new Table({
                    attrs: {
                        '.table-link': { 'xlink:href': element.link, 'xlink:show': 'new', 'cursor': 'pointer' },
                        '.columns-link': { 'xlink:href': element.columns_link, 'xlink:show': 'new', 'cursor': 'pointer' },
                        '.indicies-link': { 'xlink:href': element.indicies_link, 'xlink:show': 'new', 'cursor': 'pointer' },
                        '.triggers-link': { 'xlink:href': element.triggers_link, 'xlink:show': 'new', 'cursor': 'pointer' }
                    },
                    dbId: element.id,
                    name: element.name,
                    position: { x: element.position.x, y: element.position.y },
                    columns: element.columns,
                    indicies: element.indicies,
                    triggers: element.triggers,
                    refCount: 0
                });
                break;
            case 'view':
                current = new TableView({
                    attrs: {
                        '.view-link': { 'xlink:href': element.link, 'xlink:show': 'new', 'cursor': 'pointer' },
                        '.columns-link': { 'xlink:href': element.columns_link, 'xlink:show': 'new', 'cursor': 'pointer' },
                        '.indicies-link': { 'xlink:href': element.indicies_link, 'xlink:show': 'new', 'cursor': 'pointer' },
                        '.triggers-link': { 'xlink:href': element.triggers_link, 'xlink:show': 'new', 'cursor': 'pointer' }
                    },
                    dbId: element.id,
                    name: element.name,
                    position: { x: element.position.x, y: element.position.y },
                    columns: element.columns,
                    refCount: 0
                });
                break;
            case 'shortcut':
                current = new TableShortcut({
                    attrs: {
                        '.shortcut-link': { 'xlink:href': element.link, 'xlink:show': 'new', 'cursor': 'pointer' }
                    },
                    dbId: element.id,
                    name: element.name,
                    position: { x: element.position.x, y: element.position.y },
                    fields: element.fields,
                    refCount: 0,
                    isShortcut: true
                });
                break;
            case 'sequence':
                current = new Sequence({
                    attrs: {
                        '.sequence-link': { 'xlink:href': element.link, 'xlink:show': 'new', 'cursor': 'pointer' }
                    },
                    dbId: element.id,
                    name: element.name,
                    position: { x: element.position.x, y: element.position.y }
                });
                break;
            case 'label':
                current = new Label({
                    name: element.text,
                    position: { x: element.position.x, y: element.position.y }
                });
        }
        graph.addCell(current);
    }

    _.each(jsonData.references, function(reference) {
        var ref;
        var source = getElementById(graph, reference.source);
        var target = getElementById(graph, reference.target);

        if(reference.type == 'ForeignKeyReference') {
            ref	 = new ForeignKeyReference({
                attrs: {
                    '.ref-link': { 'xlink:href': reference.link, 'xlink:show': 'new', 'cursor': 'pointer' }
                },
                source: { id: source.id, dbId: reference.source },
                target: { id: target.id, dbId: reference.target },
                childColumn: reference.childColumn,
                parentColumn: reference.parentColumn
            });
        } else if(reference.type == 'MasterDetailReference') {
            ref = new MasterDetailReference({
                attrs: {
                    '.ref-link': { 'xlink:href': reference.link, 'xlink:show': 'new', 'cursor': 'pointer' }
                },
                source: { id: source.id, dbId: reference.source },
                target: { id: target.id, dbId: reference.target },
                childColumn: reference.childColumn,
                parentColumn: reference.parentColumn
            });
        }

        source.attributes.refCount++;
        target.attributes.refCount++;

        graph.addCell(ref);
        routeLink(mainPaper, graph, ref);
    });

    // Paper adaptation part
    var requiredWidth = 0;
    var requiredHeight = 0;

    // For virtual grid
    var maxWidth = 0;
    var maxHeight = 0;

    // Setting paper size according to the content
    _.each(graph.getElements(), function(element) {

        maxWidth = maxWidth > element.getWidth() ? maxWidth : element.getWidth();
        maxHeight = maxHeight > element.getHeight() ? maxHeight : element.getHeight();

        requiredWidth += element.getWidth() * PAPER_SCALE;
        requiredHeight += element.getHeight() * PAPER_SCALE;
    });

    // hides all links
    _.each(graph.getLinks(), function(link) {
        link.toBack()
    });

    // Adds some borders
    maxWidth += 50;
    maxHeight += 50;

    var i = 0;

    var elements = graph.getElements();
    if(autoPlacement) {
        for(var offsetY = 5; offsetY < requiredHeight; offsetY += maxHeight) {
            for(var offsetX = 5; i < elements.length && offsetX < requiredWidth; offsetX += maxWidth, i++) {
                elements[i].translate(offsetX, offsetY);
            }
        }
    }

    // And expands the paper
    mainPaper.setDimensions(requiredWidth, requiredHeight);

    var legendGraph = new joint.dia.Graph;
    var legendPaper = new joint.dia.Paper({
        el: $('#legend'),
        gridSize: 1,
        width: 400,
        height: 35,
        model: legendGraph,
        interactive: false
    });

    // legend initialization
    var legend = new Legend({
        name: ['Legend (click for expand/collapse)'],
        position: { x: 5, y: 5 },
        attrs: { rect: { width: 390, height: 25 } }
    });

    legendGraph.addCell(legend);

    // legend drawing by click
    legendPaper.on('cell:pointerdown', function(cellView, evt, x, y) {

        var elements = this.model.getElements();

        for(var i = 0; i < elements.length; i++) {
            if(elements[i].findView(legendPaper) == cellView && elements[i].attributes.type == 'Legend') {
                if(elements.length == 1) {

                    var legend = new Legend({
                        name: ['Legend (click for expand/collapse)'],
                        position: { x: 5, y: 5 },
                        attrs: { rect: { width: 390, height: 180 } }
                    });

                    legendPaper.setDimensions(400, 190);

                    legendGraph.clear();
                    legendGraph.addCell(legend);

                    var table1 = new Table({
                        name: 'Table',
                        position: { x: 20, y: 50 },
                        attrs: {
                            rect: { width: 100 },
                            '.table-name-text': { 'font-size': TABLE_SUBTITLE_FONT_SIZE, 'font-weight': 'normal' }
                        }
                    });

                    legendGraph.addCell(table1);

                    var view = new TableView({
                        name: 'View',
                        position: { x: 280, y: 50 },
                        attrs: {
                            rect: { width: 100 },
                            '.table-name-text': { 'font-size': TABLE_SUBTITLE_FONT_SIZE, 'font-weight': 'normal' }
                        }
                    });

                    legendGraph.addCell(view);

                    var foreignKeyRef = new ForeignKeyReference({
                        type: 'ForeignKeyReference',
                        source: { id: table1.id },
                        target: { id: view.id },
                        childColumn: 'Foreign key reference, child (Table)',
                        parentColumn: 'parent (View)',
                        labels: [
                            { position: .5, y: .5,
                                attrs: {
                                    text: { text: 'Foreign key ref.', 'font-size': '14', 'font-family': 'Consolas', 'transform': 'translate(0, -15)' },
                                    rect: { opacity: 0, 'transform': 'translate(0, -15)' }
                                }
                            }
                        ]
                    });

                    legendGraph.addCell(foreignKeyRef);

                    var shortcut = new TableShortcut({
                        name: 'Shortcut',
                        position: { x: 20, y: 110 },
                        attrs: {
                            rect: { width: 100 },
                            '.table-name-text': { 'font-size': TABLE_SUBTITLE_FONT_SIZE, 'font-weight': 'normal' }
                        }
                    });

                    legendGraph.addCell(shortcut);

                    var table2 = new Table({
                        name: 'Table',
                        position: { x: 280, y: 110 },
                        attrs: {
                            rect: { width: 100 },
                            '.table-name-text': { 'font-size': TABLE_SUBTITLE_FONT_SIZE, 'font-weight': 'normal' }
                        }
                    });

                    legendGraph.addCell(table2);

                    var masterDetailRef = new MasterDetailReference({
                        type: 'MasterDetailReference',
                        source: { id: table2.id },
                        target: { id: shortcut.id },
                        childColumn: 'Master-detail reference, child (Table)',
                        parentColumn: 'parent (Shortcut)',
                        labels: [
                            { position: .5, y: .5,
                                attrs: {
                                    text: { text: 'Master-detail ref.', 'font-size': '14', 'font-family': 'Consolas', 'transform': 'translate(0, -15)' },
                                    rect: { opacity: 0, 'transform': 'translate(0, -15)' }
                                }
                            }
                        ]
                    });

                    legendGraph.addCell(masterDetailRef);

                    var sequence = new Table({
                        name: 'Sequence',
                        position: { x: 150, y: 150 },
                        attrs: {
                            rect: { width: 100 },
                            '.table-name-text': { 'font-size': TABLE_SUBTITLE_FONT_SIZE, 'font-weight': 'normal' },
                            '.table-name-rect': {
                                'stroke': TABLE_STROKE_COLOR,
                                'stroke-width': TABLE_STROKE_WIDTH,
                                'fill': {
                                    type: 'linearGradient',
                                    stops: [
                                        { offset: '0%', color: SEQ_NAME_RECT_COLOR },
                                        { offset: '100%', color: SEQ_NAME_RECT_COLOR }
                                    ]
                                }
                            }
                        }
                    });

                    legendGraph.addCell(sequence);

                } else {

                    _.each(legendGraph.getLinks(), function(link){
                        link.disconnect();
                        link.remove();
                    });
                    _.each(legendGraph.getElements(), function(element){
                        element.remove();
                    });

                    var legend = new Legend({
                        name: ['Legend (click for expand/collapse)'],
                        position: { x: 5, y: 5 },
                        attrs: { rect: { width: 390, height: 25 } }
                    });

                    legendPaper.setDimensions(400, 35);

                    legendGraph.addCell(legend);

                }
            }
        }
    });

    bindLinks();
}
Legend = joint.shapes.basic.Generic.extend({

    markup: [
        '<rect class="table-name-rect" cursor="pointer"/>' +
        '<text class="table-name-text" cursor="pointer"/>'

    ].join(''),

    defaults: joint.util.deepSupplement({

        type: 'Legend',

        attrs: {

            rect: { 'width': BASE_ELEMENT_WIDTH, 'height': 0 },
            '.table-name-rect': {
                'stroke': TABLE_STROKE_COLOR,
                'stroke-width': TABLE_STROKE_WIDTH,
                'fill': {
                    type: 'linearGradient',
                    stops: [
                        { offset: '0%', color: 'MintCream' },
                        { offset: '100%', color: 'MintCream' }
                    ]
                }
            },

            '.table-name-text': {
                'ref': '.table-name-rect', 'ref-y': 15, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_SUBTITLE_FONT_SIZE, 'font-family': FONT_FAMILY
            }
        },

        name: []

    }, joint.shapes.basic.Generic.prototype.defaults),

    initialize: function() {
        // TODO: check correctness
        this.on('change', function() {
            this.updateRectangles();
            this.trigger('table-update');
        }, this);

        this.updateRectangles();

        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
    },

    updateRectangles: function() {

        var attrs = this.get('attrs');
        attrs['.table-name-text'].text = this.get('name').join('\n');

    }
});

// Basic database diagram elements
ForeignKeyReference = joint.dia.Link.extend({

    markup: [
        '<path class="connection" stroke="' + REF_COLOR + '" stroke-width="' + REF_STROKE_WIDTH + '" />' +
        '<path class="marker-target" fill="' + REF_COLOR + '" stroke="' + REF_COLOR + '" />' +
        //'<a class="ref-link">' +
        '<path class="connection-wrap">' +
        '<title class="ref-desc">%title</title>' +
        '</path>' /*
         //'</a>'+
         '<g class="labels"/>' +
         '<g class="marker-vertices"/>' */

    ].join(''),

    /*
     vertexMarkup: [
     '<g class="marker-vertex-group" transform="translate(<%= x %>, <%= y %>)">',
     '<circle class="marker-vertex" idx="<%= idx %>" r="8" />',
     '<path class="marker-vertex-remove-area" idx="<%= idx %>" fill="#A30000" d="M16,5.333c-7.732,0-14,4.701-14,10.5c0,1.982,0.741,3.833,2.016,5.414L2,25.667l5.613-1.441c2.339,1.317,5.237,2.107,8.387,2.107c7.732,0,14-4.701,14-10.5C30,10.034,23.732,5.333,16,5.333z" transform="translate(5, -33)"/>',
     '<path class="marker-vertex-remove" idx="<%= idx %>" transform="scale(.8) translate(9.5, -37)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z">',
     '<title>Remove vertex</title>',
     '</path>',
     '</g>'
     ].join(''), */

    defaults: {

        type: 'ForeignKeyReference',
        attrs: {
            '.marker-target': {
                d: 'M 12 0 L 0 6 L 12 12 z'
            }
        },
        source:     {},
        target:     {}


    },

    initialize: function(options) {

        if (!options || !options.id) {

            this.set('id', joint.util.uuid(), { silent: true });
        }

        this._transitionIds = {};

        // Collect ports defined in `attrs` and keep collecting whenever `attrs` object changes.
        this.processPorts();
        this.on('change:attrs', this.processPorts, this);

        this.setTitle();
    },

    // Shows hint with foreign keys names
    setTitle: function() {
        this.markup = this.markup.toString().replace('%title', this.attributes.childColumn + ' => ' + this.attributes.parentColumn);
    }
});

MasterDetailReference = ForeignKeyReference.extend({

    defaults: {

        type: 'MasterDetailReference',
        attrs: {
            '.marker-target': {
                d: 'M 12 0 L 0 6 L 12 12 z'
            },
            '.connection': {
                'stroke-dasharray': '10, 5'
            }
        }
    }
});

Table = joint.shapes.basic.Generic.extend({

    markup: [
        '<rect class="table-name-rect"/>' +
        '<rect class="table-columns-title-rect"/>' +
        '<rect class="table-columns-rect"/>' +
        '<rect class="table-indicies-title-rect"/>' +
        '<rect class="table-indicies-rect"/>' +
        '<rect class="table-triggers-title-rect"/>' +
        '<rect class="table-triggers-rect"/>' +
        '<a class="table-link">' +
        '<text class="table-name-text"/>' +
        '</a>' +
        '<text class="table-columns-title-text"/>' +
        '<text class="table-columns-text"/>' +
        '<text class="table-columns-pk-text"/>' +
        '<text class="table-indicies-title-text"/>' +
        '<text class="table-indicies-text"/>' +
        '<text class="table-triggers-title-text"/>' +
        '<text class="table-triggers-text"/>'

    ].join(''),

    defaults: joint.util.deepSupplement({

        type: 'Table',

        attrs: {

            rect: { 'width': BASE_ELEMENT_WIDTH },
            'height': 0,

            '.table-name-rect': {
                'stroke': TABLE_STROKE_COLOR,
                'stroke-width': TABLE_STROKE_WIDTH,
                'fill': {
                    type: 'linearGradient',
                    stops: [
                        { offset: '0%', color: TABLE_NAME_RECT_COLOR },
                        { offset: '100%', color: TABLE_NAME_RECT_COLOR }
                    ]
                }
            },
            '.table-columns-title-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_COLUMNS_TITLE_RECT_COLOR },
            '.table-columns-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_COLUMNS_RECT_COLOR },
            '.table-indicies-title-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_INDICIES_TITLE_RECT_COLOR },
            '.table-indicies-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_INDICIES_RECT_COLOR },
            '.table-triggers-title-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_TRIGGERS_TITLE_RECT_COLOR },
            '.table-triggers-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_TRIGGERS_RECT_COLOR },

            '.table-name-text': {
                'ref': '.table-name-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_TITLE_FONT_SIZE, 'font-family': FONT_FAMILY, 'font-weight': 'bold'
            },
            '.table-columns-title-text': {
                'ref': '.table-columns-title-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_SUBTITLE_FONT_SIZE, 'font-style': 'italic', 'font-family': FONT_FAMILY
            },
            '.table-columns-text': {
                'ref': '.table-columns-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_FIELDS_FONT_SIZE, 'font-family': FONT_FAMILY
            },
            '.table-columns-pk-text': {
                'ref': '.table-columns-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_FIELDS_FONT_SIZE, 'font-family': FONT_FAMILY, 'font-weight': 'bold'
            },
            '.table-indicies-title-text': {
                'ref': '.table-indicies-title-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_SUBTITLE_FONT_SIZE, 'font-style': 'italic', 'font-family': FONT_FAMILY
            },
            '.table-indicies-text': {
                'ref': '.table-indicies-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_FIELDS_FONT_SIZE, 'font-family': FONT_FAMILY
            },
            '.table-triggers-title-text': {
                'ref': '.table-triggers-title-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_SUBTITLE_FONT_SIZE, 'font-style': 'italic', 'font-family': FONT_FAMILY
            },
            '.table-triggers-text': {
                'ref': '.table-triggers-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_FIELDS_FONT_SIZE, 'font-family': FONT_FAMILY
            }
        },

        name: [],
        columns_title: 'Columns',
        columns: [],
        indicies_title: 'Indicies',
        indicies: [],
        triggers_title: 'Triggers',
        triggers: []

    }, joint.shapes.basic.Generic.prototype.defaults),

    initialize: function() {
        // TODO: check correctness
        this.on('change:name change:columns-title change:columns change:columns-pk change:indicies-title change:indicies change:triggers-title change:triggers', function() {
            this.updateRectangles();
            this.trigger('table-update');
        }, this);

        this.updateRectangles();

        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
    },

    getWidth: function() {
        return this.get('attrs').rect.width;
    },

    getHeight: function() {
        return this.get('attrs').height;
    },

    getName: function() {
        return this.get('name');
    },

    updateRectangles: function() {

        var attrs = this.get('attrs');

        var width = this.getWidth();
        var height = this.getHeight();

        var elements = [
            { type: 'name', title: this.getName() },
            { type: 'columns', title: this.get('columns_title'), text: this.get('columns') },
            { type: 'indicies', title: this.get('indicies_title'), text: this.get('indicies') },
            { type: 'triggers', title: this.get('triggers_title'), text: this.get('triggers') }

        ];

        // Preparing for check maximal weigheted string lines
        var allFields = [];
        var title;

        var expandPixels = 0;

        var titleExpandPixels = 0;
        var fieldsExpandPixels = 0;
        var buffer;

        var offsetY = 0;

        _.each(elements, function(rect) {

            var lines = _.isArray(rect.text) ? rect.text : [rect.text];

            // Titles height
            var rectHeight = 24;

            if(rect.type == 'name') {
                title = rect.title;
                attrs['.table-name-text'].text = title;
                attrs['.table-name-rect'].height = rectHeight;
                attrs['.table-name-rect'].transform = 'translate(0,'+ offsetY + ')';
                offsetY += rectHeight;
                height += rectHeight;
            } else {

                var linesPk = [];
                var isFound = false;

                for(var i = 0; i < lines.length; i++){
                    if(rect.type == 'columns') {
                        if(lines[i].charAt(0) == '*') {
                            lines[i] = lines[i].replace('*', '');
                            linesPk.push(lines[i]);
                            allFields.push(lines[i]);
                            lines[i] = '';
                            isFound = true;
                        } else {
                            linesPk.push('');
                        }
                    } else {
                        allFields.push(lines[i]);
                    }
                }

                // ----- Collecting of links and saving to '_links'

                for(var i = 0; i < linesPk.length; i++){
                    var body = linesPk[i].split('@')[0];
                    if(body != "") {
                        var link = linesPk[i].split('@')[1];
                        this._links.push(link);
                        linesPk[i] = body + '@';
                    }

                }

                for(var i = 0; i < lines.length; i++){
                    var body = lines[i].split('@')[0];
                    if(body != "") {
                        var link = lines[i].split('@')[1];
                        this._links.push(link);
                        lines[i] = body + '@';
                    }

                }
                // -----------------------------------------------

                _.each(lines, function(line) { allFields.push(line); } );

                // If set of fields is not empty, else - skip
                if(lines.length != 0) {

                    attrs['.table-' + rect.type + '-title-text'].text = rect.title;
                    attrs['.table-' + rect.type + '-title-rect'].height = rectHeight;
                    attrs['.table-' + rect.type + '-title-rect'].transform = 'translate(0,'+ offsetY + ')';

                    offsetY += rectHeight;
                    height += rectHeight;

                    rectHeight = lines.length * FIELD_HEIGHT + LINES_VERT_PADDING;

                    if(rect.type == 'columns' && isFound) {
                        attrs['.table-columns-pk-text'].text = linesPk.join('\n');
                    }

                    attrs['.table-' + rect.type + '-text'].text = lines.join('\n');
                    attrs['.table-' + rect.type + '-rect'].height = rectHeight;
                    attrs['.table-' + rect.type + '-rect'].transform = 'translate(0,'+ offsetY + ')';

                    offsetY += rectHeight;
                    height += rectHeight;

                }
            }

        });

        // Now it's time for magic!
        _.each(allFields, function(field) {
            field = field.split('@')[0];
            buffer = (field.length - FIELDS_CHARS_CAPACITY) <= 0 ? 0 : (field.length - FIELDS_CHARS_CAPACITY) * FIELDS_CHARS_WEIGHT;
            fieldsExpandPixels = fieldsExpandPixels < buffer ? buffer : fieldsExpandPixels;
        });

        titleExpandPixels = (title.length - TITLE_CHARS_CAPACITY) <= 0 ? 0 : (title.length - TITLE_CHARS_CAPACITY) * TITLE_CHARS_WEIGHT;

        expandPixels = titleExpandPixels > fieldsExpandPixels ? titleExpandPixels : fieldsExpandPixels;

        width += expandPixels;

        this.get('attrs').rect.width = width;
        this.get('attrs').height = height;
    }
});

TableShortcut = joint.shapes.basic.Generic.extend({

    markup: [
        '<rect class="table-name-rect"/>' +
        '<rect class="table-fields-rect"/>' +
        '<a class="shortcut-link">' +
        '<text class="table-name-text"/>' +
        '</a>' +
        '<text class="table-fields-text"/>'

    ].join(''),

    defaults: joint.util.deepSupplement({

        type: 'TableShortcut',

        attrs: {

            rect: { 'width': BASE_ELEMENT_WIDTH },
            'height': 0,

            '.table-name-rect': {
                'stroke': TABLE_STROKE_COLOR,
                'stroke-width': TABLE_STROKE_WIDTH,
                'fill': {
                    type: 'linearGradient',
                    stops: [
                        { offset: '0%', color: TABLE_SHORTCUT_NAME_RECT_COLOR },
                        { offset: '100%', color: TABLE_SHORTCUT_NAME_RECT_COLOR }
                    ]
                }
            },

            '.table-fields-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_COLUMNS_RECT_COLOR },

            '.table-name-text': {
                'ref': '.table-name-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_TITLE_FONT_SIZE, 'font-family': FONT_FAMILY, 'font-weight': 'bold'
            },
            '.table-fields-text': {
                'ref': '.table-fields-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_FIELDS_FONT_SIZE, 'font-family': FONT_FAMILY, 'font-weight': 'bold'
            }
        },

        name: [],
        fields: []

    }, joint.shapes.basic.Generic.prototype.defaults),

    initialize: function() {
        // TODO: check correctness
        this.on('change:name change:field', function() {
            this.updateRectangles();
            this.trigger('table-update');
        }, this);

        this.updateRectangles();

        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
    },

    getWidth: function() {
        return this.get('attrs').rect.width;
    },

    getHeight: function() {
        return this.get('attrs').height;
    },

    getName: function() {
        return this.get('name');
    },

    updateRectangles: function() {

        var attrs = this.get('attrs');

        var width = this.getWidth();
        var height = this.getHeight();

        var elements = [
            { type: 'name', title: this.getName(), text: this.getName() },
            { type: 'fields', title: '', text: this.get('fields') }

        ];

        var fields;
        var title;

        var expandPixels = 0;

        var titleExpandPixels = 0;
        var fieldsExpandPixels = 0;
        var buffer;

        var offsetY = 0;

        _.each(elements, function(rect) {

            var lines = rect.text;

            // Titles height
            var rectHeight = TITLE_HEIGHT;

            if(rect.type == 'name') {

                title = lines;

                attrs['.table-name-text'].text = title;
                attrs['.table-name-rect'].height = rectHeight;
                attrs['.table-name-rect'].transform = 'translate(0,'+ offsetY + ')';

                offsetY += rectHeight;
                height += rectHeight;

            }

            if(rect.type == 'fields') {
                if(lines != 0) {

                    // ----- Collecting of links and saving to '_links'

                    for(var i = 0; i < lines.length; i++){
                        var body = lines[i].split('@')[0];
                        if(body != "") {
                            var link = lines[i].split('@')[1];
                            this._links.push(link);
                            lines[i] = body + '@';
                        }

                    }

                    fields = lines;

                    rectHeight = lines.length * FIELD_HEIGHT + LINES_VERT_PADDING;

                    attrs['.table-fields-text'].text = fields.join('\n');
                    attrs['.table-fields-rect'].height = rectHeight;
                    attrs['.table-fields-rect'].transform = 'translate(0,'+ offsetY + ')';

                    offsetY += rectHeight;
                    height += rectHeight;
                }
            }
        });

        // Now it's time for magic!
        _.each(fields, function(field) {
            field = field.split('@')[0];
            buffer = (field.length - FIELDS_CHARS_CAPACITY) <= 0 ? 0 : (field.length - FIELDS_CHARS_CAPACITY) * FIELDS_CHARS_WEIGHT;
            fieldsExpandPixels = fieldsExpandPixels < buffer ? buffer : fieldsExpandPixels;
        });

        titleExpandPixels = (title.length - TITLE_CHARS_CAPACITY) <= 0 ? 0 : (title.length - TITLE_CHARS_CAPACITY) * TITLE_CHARS_WEIGHT;

        expandPixels = titleExpandPixels > fieldsExpandPixels ? titleExpandPixels : fieldsExpandPixels;

        width += expandPixels;

        this.get('attrs').rect.width = width;
        this.get('attrs').height = height;
    }
});

Sequence = joint.shapes.basic.Generic.extend({

    markup: [
        '<rect class="seq-name-rect"/>' +
        '<rect class="seq-field-rect"/>' +
        '<a class="sequence-link">' +
        '<text class="seq-name-text"/>' +
        '</a>' +
        '<text class="seq-field-text"/>'

    ].join(''),

    defaults: joint.util.deepSupplement({

        type: 'Sequence',

        attrs: {

            rect: { 'width': BASE_ELEMENT_WIDTH },
            'height': 0,

            '.seq-name-rect': {
                'stroke': TABLE_STROKE_COLOR,
                'stroke-width': TABLE_STROKE_WIDTH,
                'fill': {
                    type: 'linearGradient',
                    stops: [
                        { offset: '0%', color: SEQ_NAME_RECT_COLOR },
                        { offset: '100%', color: SEQ_NAME_RECT_COLOR }
                    ]
                }
            },
            '.seq-field-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_COLUMNS_RECT_COLOR },

            '.seq-name-text': {
                'ref': '.seq-name-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_TITLE_FONT_SIZE, 'font-family': FONT_FAMILY, 'font-weight': 'bold'
            },
            '.seq-field-text': {
                'ref': '.seq-field-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_FIELDS_FONT_SIZE, 'font-family': FONT_FAMILY, 'font-style': 'italic'
            }
        },

        name: []

    }, joint.shapes.basic.Generic.prototype.defaults),

    initialize: function() {
        // TODO: check correctness
        this.on('change:name change:field', function() {
            this.updateRectangles();
            this.trigger('table-update');
        }, this);

        this.updateRectangles();

        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
    },

    getWidth: function() {
        return this.get('attrs').rect.width;
    },

    getHeight: function() {
        return this.get('attrs').height;
    },

    getName: function() {
        return this.get('name');
    },

    updateRectangles: function() {

        var attrs = this.get('attrs');

        var width = this.getWidth();
        var height = this.getHeight();

        var elements = [
            { type: 'name', title: this.getName(), text: this.getName() }
        ];

        var title;

        var titleExpandPixels = 0;

        var offsetY = 0;

        _.each(elements, function(rect) {

            var line = rect.text;

            // Titles height
            var rectHeight = TITLE_HEIGHT;

            title = line;

            attrs['.seq-name-text'].text = title;
            attrs['.seq-name-rect'].height = rectHeight;
            attrs['.seq-name-rect'].transform = 'translate(0,'+ offsetY + ')';

            offsetY += rectHeight;
            height += rectHeight;

            attrs['.seq-field-text'].text = 'Sequence';
            attrs['.seq-field-rect'].height = rectHeight;
            attrs['.seq-field-rect'].transform = 'translate(0,'+ offsetY + ')';

            offsetY += rectHeight;
            height += rectHeight;

        });

        // Now it's time for magic!
        titleExpandPixels = (title.length - TITLE_CHARS_CAPACITY) <= 0 ? 0 : (title.length - TITLE_CHARS_CAPACITY) * TITLE_CHARS_WEIGHT;

        width += titleExpandPixels;

        this.get('attrs').rect.width = width;
        this.get('attrs').height = height;
    }
});

TableView = Table.extend({

    markup: [
        '<rect class="table-name-rect"/>' +
        '<rect class="table-columns-title-rect"/>' +
        '<rect class="table-columns-rect"/>' +
        '<rect class="table-indicies-title-rect"/>' +
        '<rect class="table-indicies-rect"/>' +
        '<rect class="table-triggers-title-rect"/>' +
        '<rect class="table-triggers-rect"/>' +
        '<a class="view-link">' +
        '<text class="table-name-text"/>' +
        '</a>' +
        '<text class="table-columns-title-text"/>' +
        '<text class="table-columns-text"/>' +
        '<text class="table-columns-pk-text"/>' +
        '<text class="table-indicies-title-text"/>' +
        '<text class="table-indicies-text"/>' +
        '<text class="table-triggers-title-text"/>' +
        '<text class="table-triggers-text"/>'

    ].join(''),

    defaults: joint.util.deepSupplement({

        type: 'TableView',

        attrs: {

            rect: { 'width': BASE_ELEMENT_WIDTH},
            'height': 0,

            '.table-name-rect': {
                'stroke': TABLE_STROKE_COLOR,
                'stroke-width': TABLE_STROKE_WIDTH,
                'fill': {
                    type: 'linearGradient',
                    stops: [
                        { offset: '0%', color: TABLE_VIEW_NAME_RECT_COLOR },
                        { offset: '100%', color: TABLE_VIEW_NAME_RECT_COLOR }
                    ]
                }
            },
            '.table-columns-title-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_COLUMNS_TITLE_RECT_COLOR },
            '.table-columns-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_COLUMNS_RECT_COLOR },
            '.table-indicies-title-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_INDICIES_TITLE_RECT_COLOR },
            '.table-indicies-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_INDICIES_RECT_COLOR },
            '.table-triggers-title-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_TRIGGERS_TITLE_RECT_COLOR },
            '.table-triggers-rect': { 'stroke': TABLE_STROKE_COLOR, 'stroke-width': TABLE_STROKE_WIDTH, 'fill': TABLE_TRIGGERS_RECT_COLOR },

            '.table-name-text': {
                'ref': '.table-name-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_TITLE_FONT_SIZE, 'font-family': FONT_FAMILY, 'font-weight': 'bold'
            },
            '.table-columns-title-text': {
                'ref': '.table-columns-title-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_SUBTITLE_FONT_SIZE, 'font-style': 'italic', 'font-family': FONT_FAMILY
            },
            '.table-columns-text': {
                'ref': '.table-columns-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_FIELDS_FONT_SIZE, 'font-family': FONT_FAMILY
            },
            '.table-columns-pk-text': {
                'ref': '.table-columns-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_FIELDS_FONT_SIZE, 'font-family': FONT_FAMILY, 'font-weight': 'bold'
            },
            '.table-indicies-title-text': {
                'ref': '.table-indicies-title-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_SUBTITLE_FONT_SIZE, 'font-style': 'italic', 'font-family': FONT_FAMILY
            },
            '.table-indicies-text': {
                'ref': '.table-indicies-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_FIELDS_FONT_SIZE, 'font-family': FONT_FAMILY
            },
            '.table-triggers-title-text': {
                'ref': '.table-triggers-title-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_SUBTITLE_FONT_SIZE, 'font-style': 'italic', 'font-family': FONT_FAMILY
            },
            '.table-triggers-text': {
                'ref': '.table-triggers-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_FIELDS_FONT_SIZE, 'font-family': FONT_FAMILY
            }
        },

        name: [],
        columns_title: 'Columns',
        columns: [],
        indicies_title: 'Indicies',
        indicies: [],
        triggers_title: 'Triggers',
        triggers: []

    }, joint.shapes.basic.Generic.prototype.defaults)
});

Label = joint.shapes.basic.Generic.extend({

    markup: [
        '<rect class="label-rect"/>' +
        '<text class="label-text"/>'

    ].join(''),

    defaults: joint.util.deepSupplement({

        type: 'Label',

        attrs: {

            rect: { 'width': BASE_ELEMENT_WIDTH },
            'height': 0,

            '.label-rect': {
                'stroke': LABEL_COLOR,
                'stroke-width': TABLE_STROKE_WIDTH,
                'fill': {
                    type: 'linearGradient',
                    stops: [
                        { offset: '0%', color: LABEL_COLOR },
                        { offset: '100%', color: LABEL_COLOR }
                    ]
                }
            },

            '.label-text': {
                'ref': '.label-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle',
                'fill': TABLE_FONT_COLOR, 'font-size': TABLE_TITLE_FONT_SIZE, 'font-family': FONT_FAMILY, 'font-style': 'italic'
            }
        },

        label: []

    }, joint.shapes.basic.Generic.prototype.defaults),

    initialize: function() {
        // TODO: check correctness
        this.on('change:label', function() {
            this.updateRectangles();
            this.trigger('table-update');
        }, this);

        this.updateRectangles();

        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
    },

    getWidth: function() {
        return this.get('attrs').rect.width;
    },

    getHeight: function() {
        return this.get('attrs').height;
    },

    getName: function() {
        return this.get('name');
    },

    updateRectangles: function() {

        var attrs = this.get('attrs');

        var width = this.getWidth();
        var height = this.getHeight();

        var elements = [
            { type: 'label', text: this.getName() }
        ];

        var title;

        var titleExpandPixels = 0;

        var offsetY = 0;

        _.each(elements, function(rect) {

            var line = rect.text;

            // Titles height
            var rectHeight = TITLE_HEIGHT;

            title = line;

            attrs['.label-text'].text = title;
            attrs['.label-rect'].height = rectHeight;
            attrs['.label-rect'].transform = 'translate(0,'+ offsetY + ')';

            offsetY += rectHeight;
            height += rectHeight;

        });

        // Now it's time for magic!
        titleExpandPixels = (title.length - TITLE_CHARS_CAPACITY) <= 0 ? 0 : (title.length - TITLE_CHARS_CAPACITY) * TITLE_CHARS_WEIGHT;

        width += titleExpandPixels;

        this.get('attrs').rect.width = width;
        this.get('attrs').height = height;
    }
});

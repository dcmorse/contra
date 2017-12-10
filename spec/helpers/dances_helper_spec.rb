# coding: utf-8
require 'rails_helper'

RSpec.describe DancesHelper, type: :helper do

  figure_txt_for = -> move, *parameter_values {
    JSLibFigure.html({'move' => move, 'parameter_values' => parameter_values})
  }

  def whitespice(x) 
    case x
    when Regexp; x
    when String;
      quote = Regexp.escape(x).to_s
      /\A\s*#{quote.gsub('\ ','\s+')}\s*\z/
    else raise 'unexpected type in whitespice'
    end
  end

  [['____ allemande ____ once', 'allemande', nil, nil, 360, 8],
   ['partners balance & swing', 'swing', 'partners',true, 16],
   ['neighbors balance & swing', 'swing', 'neighbors', true, 16],
   ['neighbors swing', 'swing', 'neighbors', false, 8],
   ['neighbors balance & swing for 8', 'swing', 'neighbors', true, 8],
   ['partners long swing','swing', 'partners', false, 16],
   ['partners swing for 20','swing', 'partners', false, 20],
   ['partners balance & swing for 20','swing', 'partners', true, 20],
   ['* optional balance & swing for *', 'swing', '*','*', '*'],
   ['gentlespoons allemande right 1½', 'allemande', 'gentlespoons', true, 540, 8],
   ['gentlespoons allemande right twice for 10', 'allemande', 'gentlespoons', true, 720, 10],
   ['* allemande * hand * for *', 'allemande', '*', '*', '*', '*'],
   ['ladles allemande left 1½ around while the gentlespoons orbit clockwise ½ around', 'allemande orbit','ladles',false,540,180,8],
   ["* allemande * hand * around while the * orbit * * around for *", 'allemande orbit','*','*','*','*','*'],
   ['balance', 'balance', 'everyone', 4],
   ['ones balance', 'balance', 'ones', 4],
   ['ones balance for 8', 'balance', 'ones', 8],
   ['* balance for *', 'balance', '*', '*'],
   ['balance the ring', 'balance the ring', 4],
   ['balance the ring for 6', 'balance the ring', 6],
   ['balance the ring for 8', 'balance the ring', 8],
   ['balance the ring for *', 'balance the ring', '*'],
   ['ladies chain', 'chain', 'ladies', 'across', 8],
   ['left diagonal gentlespoons chain', 'chain', 'gentlespoons', 'left diagonal', 8],
   ['* * chain for *', 'chain', '*', '*', '*'],
   ['circle left 4 places','circle',true,360,8],
   ['circle right 4 places','circle',false,360,8],
   ['circle left 3 places', 'circle', true, 270, 8],
   ['circle * * places for *', 'circle', '*', '*', '*'],
   ['put your right hand in', 'custom', 'put your right hand in', 8],
   ['put your right hand in for 16', 'custom', 'put your right hand in', 16],
   ['custom', 'custom', '  ', 8],
   ['custom for *', 'custom', '*', '*'],
   ['custom for *', 'custom', ' ', '*'],
   ['put your right hand in for *', 'custom', 'put your right hand in', '*'],
   ['half hey, ladles lead', 'hey', 'ladles', 0.5, 'across', 8],
   ['hey, gentlespoons lead', 'hey', 'gentlespoons', 1.0, 'across', 16],
   ['right diagonal hey, gentlespoons lead', 'hey', 'gentlespoons', 1.0, 'right diagonal', 16],
   ['* * hey, * lead for *', 'hey', '*', '*', '*', '*'],
   ['long lines forward & back', 'long lines', true, 8],
   ['long lines forward for 3', 'long lines', false, 3],
   ['long lines forward', 'long lines', false, 4],
   ['long lines forward & maybe back for *', 'long lines', '*', '*'],
   ['balance & petronella', 'petronella', true, 8],
   ['cross trails - partners along the set right shoulders, neighbors across the set left shoulders, for 8', 'cross trails', 'partners', 'along', true, 'neighbors', 8],
   ['cross trails - neighbors across the set right shoulders, partners along the set left shoulders', 'cross trails', 'neighbors', 'across', true, 'partners', 4],
   ['cross trails - * * the set * shoulders, * * the set * shoulders, for *', 'cross trails', '*', '*', '*', '*', '*'],
   # ['petronella', 'petronella', false, 8], ambiguous
   ['balance & petronella', 'petronella', true, 8],
   ['optional balance & petronella for *', 'petronella', '*', '*'],
   ['progress to new neighbors', 'progress', 0],
   ['progress to new neighbors for *', 'progress', '*'],
   ['pull by right', 'pull by direction', false, 'along', true, 2],
   ['pull by left', 'pull by direction', false, 'along', false, 2],
   ['pull by right across the set', 'pull by direction', false, 'across', true, 2],
   ['pull by left across the set', 'pull by direction', false, 'across', false, 2],
   ['balance & pull by right', 'pull by direction', true, 'along', true, 8],
   ['balance & pull by left for 6', 'pull by direction', true, 'along', false, 6],
   ['balance & pull by right across the set', 'pull by direction', true, 'across', true, 8],
   ['balance & pull by left across the set for 6', 'pull by direction', true, 'across', false, 6],
   ['pull by left across the set for 4', 'pull by direction', false, 'across', false, 4],
   ['pull by left diagonal for 4', 'pull by direction', false, 'left diagonal', false, 4],
   ['pull by left hand right diagonal for 4', 'pull by direction', false, 'right diagonal', false, 4],
   ['pull by right hand left diagonal for 4', 'pull by direction', false, 'left diagonal', true, 4],
   ['pull by right diagonal for 4', 'pull by direction', false, 'right diagonal', true, 4],
   ['pull by left hand right diagonal for 4', 'pull by direction', false, 'right diagonal', false, 4],
   ['optional balance & pull by * hand * for *', 'pull by direction', '*', '*', '*', '*'],
   ['gentlespoons pull by right', 'pull by dancers', 'gentlespoons', false, true, 2],
   ['ladles pull by left', 'pull by dancers', 'ladles', false, false, 2],
   ['ones balance & pull by left for 6', 'pull by dancers', 'ones', true, false, 6],
   ['* optional balance & pull by * hand for *', 'pull by dancers', '*', '*', '*', '*'],
   ['neighbors promenade left diagonal on the left', 'promenade', 'neighbors', 'left diagonal', true, 8],
   ['neighbors promenade', 'promenade', 'neighbors', 'across', false, 8],
   ['neighbors promenade along the set on the right', 'promenade', 'neighbors', 'along', false, 8],
   ['neighbors promenade along the set on the left', 'promenade', 'neighbors', 'along', true, 8],
   ['* promenade * on the * for *', 'promenade', '*', '*', '*', '*'],
   ['right left through', 'right left through', 'across', 8],
   ['left diagonal right left through', 'right left through', 'left diagonal', 8],
   ['* right left through for *', 'right left through', '*', '*'],
   ['slide left along set to new neighbors', 'slide along set', true, 2],
   ['slide * along set for * to new neighbors', 'slide along set', '*', '*'],
   ['star promenade left ½', 'star promenade', 'gentlespoons', false, 180, 4], # prefer: "scoop up partners for star promenade"
   ['ladles star promenade right ½', 'star promenade', 'ladles', true, 180, 4],
   ['* star promenade * hand * for *', 'star promenade', '*', '*', '*', '*'],
   ['butterfly whirl', 'butterfly whirl', 4],
   ['butterfly whirl for 8', 'butterfly whirl', 8],
   ['butterfly whirl for *', 'butterfly whirl', '*'],
   ['down the hall', 'down the hall', 'forward', '', 8],
   ['down the hall and turn as couples', 'down the hall', 'forward', 'turn-couples', 8],
   ['down the hall and turn alone', 'down the hall', 'forward', 'turn-alone', 8],
   ['down the hall backward', 'down the hall', 'backward', '', 8],
   ['up the hall and bend into a ring', 'up the hall', 'forward', 'circle', 8],
   ['up the hall forward and backward', 'up the hall', 'forward and backward', '', 8],
   ['up the hall * and end however for *', 'up the hall', '*', '*', '*'],
   ['mad robin, gentlespoons in front for 6', 'mad robin', 'gentlespoons', 360, 6],
   ['mad robin, gentlespoons in front for 8', 'mad robin', 'gentlespoons', 360, 8],
   ['mad robin twice around, ladles in front for 12', 'mad robin', 'ladles', 720, 12],
   ['mad robin * around, * in front for *', 'mad robin', '*', '*', '*'],
   ['star left 4 places, hands across', 'star', false, 360, 'hands across', 8],
   ['star right 4 places', 'star', true, 360, '', 8],
   ['star left 5 places, wrist grip, for 10', 'star', false, 450, 'wrist grip', 10],
   ['star * hand * places, any grip, for *', 'star', '*', '*', '*', '*'],
   ['partners balance & swat the flea', 'swat the flea', 'partners',  true,  false, 8],
   ['* optional balance & swat the flea for *', 'swat the flea', '*',  '*',  '*', '*'],
   ['to ocean wave', 'ocean wave', 4],
   ['to ocean wave for *', 'ocean wave', '*'],
   ['gentlespoons roll away neighbors with a half sashay', 'roll away', 'gentlespoons', 'neighbors', true, 4],
   ['ladles roll away partners for 2', 'roll away', 'ladles', 'partners', false, 2],
   ['* roll away * maybe with a half sashay for *', 'roll away', '*', '*', '*', '*'],
   ["balance & Rory O'Moore right", "Rory O'Moore", 'everyone', true, false, 8],
   ["balance & centers Rory O'Moore left", "Rory O'Moore", 'centers', true, true, 8],
   ["centers Rory O'Moore left", "Rory O'Moore", 'centers', false, true, 4],
   ["optional balance & * Rory O'Moore * for *", "Rory O'Moore", '*', '*', '*', '*'],
   ['pass through for 4', 'pass through', 'along', true, 4],
   ['pass through', 'pass through', 'along', true, 2],
   ['pass through left shoulders across the set', 'pass through', 'across', false, 2],
   ['pass through * shoulders * for *', 'pass through', '*', '*', '*'],
   ['gentlespoons give & take partners', 'give & take', 'gentlespoons', 'partners', true, 8],
   ['gentlespoons give & take partners for 4', 'give & take', 'gentlespoons', 'partners', true, 4],
   ['ladles take neighbors', 'give & take', 'ladles', 'neighbors', false, 4],
   ['ladles take neighbors for 8', 'give & take', 'ladles', 'neighbors', false, 8],
   ['* give? & take * for *', 'give & take', '*', '*', '*', '*'],
   ['partners gyre meltdown', 'gyre meltdown', 'partners', 16],
   ['neighbors gyre meltdown for 12', 'gyre meltdown', 'neighbors', 12],
   ['* gyre meltdown for *', 'gyre meltdown', '*', '*'],
   ['ones gate twos to face out of the set', 'gate', 'ones', 'twos', 'out', 8],
   ['* gate * to face any direction for *', 'gate', '*', '*', '*', '*'],
   ['gentlespoons see saw once', 'see saw', 'gentlespoons', false, 360, 8],
   ['* see saw * for *', 'see saw', '*', '*', '*', '*'],
   ['petronella', 'petronella', false, 4],
   ['optional balance & petronella for *', 'petronella', '*', '*'],
   ['neighbors box the gnat', 'box the gnat',  'neighbors', false, true,  4],
   ['partners balance & box the gnat',  'box the gnat',  'partners',  true,  true,  8],
   ['* optional balance & box the gnat for *',  'box the gnat',  '*',  '*',  '*',  '*'],
   ['ladles do si do once', 'do si do', 'ladles', true, 360, 8],
   ['neighbors do si do twice for 16', 'do si do', 'neighbors', true, 720, 16],
   ['* do si do * for *', 'do si do', '*', '*', '*', '*'],
   ['shadows gyre 1½', 'gyre', 'shadows', true, 540, 8],
   ['ones gyre left shoulders 1½', 'gyre', 'ones', false, 540, 8],
   ['* gyre * for *', 'gyre', '*', '*', '*', '*'],
   ['gyre star clockwise 3 places with gentlespoons putting their left hands in and backing up for 10',
   'gyre star', 'gentlespoons', true, 270, 10],
   ['gyre star * * places with * putting their * hands in and backing up for *', 'gyre star', '*', '*', '*', '*'],
   ['gentlespoons pass by right shoulders', 'pass by', 'gentlespoons', true, 2],
   ['neighbors pass by right shoulders', 'pass by', 'neighbors', true, 2],
   ['* pass by * shoulders for *', 'pass by', '*', '*', '*'],
   ['ones figure 8', 'figure 8', 'ones', 'first ladle', 0.5, 8],
   ['gentlespoons full figure 8, first gentlespoon leading, for 16', 'figure 8', 'gentlespoons', 'first gentlespoon', 1.0, 16],
   ['twos figure 8, gentlespoon leading', 'figure 8', 'twos', 'second gentlespoon', 0.5, 8],
   ['* * figure 8, * leading, for *', 'figure 8', '*', '*', '*', '*'],
   ['zig zag left then right into a ring', 'zig zag', true, 'ring', 6],
   ['zig zag left then right into a ring for 8', 'zig zag', true, 'ring', 8],
   ['zig zag left then right, trailing two catching hands', 'zig zag', true, 'allemande', 6],
   ['zig zag right then left, trailing two catching hands, for 8', 'zig zag', false, 'allemande', 8],
   ['zig zag * then * ending however for *', 'zig zag', '*', '*', '*'],
   ['half poussette - ladles pull neighbors back then left for 8', 'poussette', 0.5, 'ladles', 'neighbors', true, 8],
   ['half poussette - twos pull ones back then right for 6', 'poussette', 0.5, 'twos', 'ones', false, 6],
   ['full poussette - twos pull ones back then right for 12', 'poussette', 1.0, 'twos', 'ones', false, 12],
   ['full poussette - twos pull ones back then right for 16', 'poussette', 1.0, 'twos', 'ones', false, 16],
   ['* poussette - * pull * back then * for *', 'poussette', '*', '*', '*', '*', '*'],
   ['square through two - partners balance & pull by right, then neighbors pull by left', 'square through', 'partners', 'neighbors', true, true, 180, 8],
   ['square through three for 6 - same roles pull by right, then partners pull by left, then same roles pull by right', 'square through', 'same roles', 'partners', false, true, 270, 6],
   ['square through three for 8 - same roles pull by right, then partners pull by left, then same roles pull by right', 'square through', 'same roles', 'partners', false, true, 270, 8],
   ['square through four - shadows balance & pull by right, then neighbors pull by left, then repeat', 'square through', 'shadows', 'neighbors', true, true, 360, 16],
   ['square through * for * - * optional balance & pull by * hand, then * pull by *, yadda yadda yadda', 'square through', '*', '*', '*', '*', '*', '*'],
   ['balance & box circulate - gentlespoons cross while ladles loop right', 'box circulate', 'gentlespoons', true, true, 8],
   ['box circulate - ones cross while twos loop left for 2', 'box circulate', 'ones', false, false, 2],
   ['optional balance & box circulate - * cross while * loop * hand for *', 'box circulate', '*', '*', '*', '*'],
   ['partners California twirl', 'California twirl', 'partners', 4],
   ['neighbors California twirl for 2', 'California twirl', 'neighbors', 2],
   ['* California twirl for *', 'California twirl', '*', '*'],
   ['ones contra corners', 'contra corners', 'ones', '', 16],
   ['twos contra corners left hands for 10', 'contra corners', 'twos', 'left hands', 10],
   ['* contra corners * for *', 'contra corners', '*', '*', '*'],
   ['slice left and straight back', 'slice', true, 'couple', 'straight', 8],
   ['slice right one dancer and diagonal back for 10', 'slice', false, 'dancer', 'diagonal', 10],
   ['slice * one * and * for *', 'slice', '*', '*', '*', '*'],
   ['turn alone', 'turn alone', 'everyone', '', 4],
   ['ladles turn alone over the right shoulder', 'turn alone', 'ladles', 'over the right shoulder', 4],
   ['ladles turn alone to a new partner', 'turn alone', 'ladles', 'to a new partner', 4],
   ['ladles turn alone face out for 2', 'turn alone', 'ladles', 'face out', 2],
   ['* turn alone for *', 'turn alone', '*', '', '*'],
  ].each do |arr|
    render, move, *pvalues = arr
    it "renders #{move} as '#{render}'" do
      expect(figure_txt_for.call(move,*pvalues)).to match(whitespice(render))
    end
  end
end

